import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const inviteSnap = await adminDb
    .collection('invites')
    .where('token', '==', token)
    .limit(1)
    .get()

  if (inviteSnap.empty) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const inviteDoc = inviteSnap.docs[0]
  const invite = inviteDoc.data()

  // Fetch the associated game slot
  const slotDoc = await adminDb.collection('gameSlots').doc(invite.gameSlotId).get()
  const slotData = slotDoc.exists ? slotDoc.data()! : null

  // Fetch roster count
  let rosterCount = 0
  if (slotDoc.exists) {
    const rosterSnap = await adminDb
      .collection('gameSlots')
      .doc(invite.gameSlotId)
      .collection('rosters')
      .get()
    rosterCount = rosterSnap.size
  }

  // Fetch sender name
  const senderDoc = await adminDb.collection('users').doc(invite.senderId).get()
  const senderName = senderDoc.exists ? senderDoc.data()!.name : invite.senderName ?? ''

  return NextResponse.json({
    id: inviteDoc.id,
    ...invite,
    sentAt: invite.sentAt instanceof Timestamp ? invite.sentAt.toDate().toISOString() : invite.sentAt,
    respondedAt: invite.respondedAt instanceof Timestamp
      ? invite.respondedAt.toDate().toISOString()
      : invite.respondedAt ?? null,
    sender: { name: senderName },
    gameSlot: slotData
      ? {
          id: invite.gameSlotId,
          ...slotData,
          startsAt: slotData.startsAt instanceof Timestamp
            ? slotData.startsAt.toDate().toISOString()
            : slotData.startsAt,
          endsAt: slotData.endsAt instanceof Timestamp
            ? slotData.endsAt.toDate().toISOString()
            : slotData.endsAt,
          _count: { rosters: rosterCount },
        }
      : null,
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { token } = await params

  const body = await req.json()
  const { status } = body
  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const inviteSnap = await adminDb
    .collection('invites')
    .where('token', '==', token)
    .limit(1)
    .get()

  if (inviteSnap.empty) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const inviteDoc = inviteSnap.docs[0]
  const invite = inviteDoc.data()

  // Only PENDING invites can transition. Once ACCEPTED/DECLINED, the token is spent.
  if (invite.status && invite.status !== 'PENDING') {
    return NextResponse.json({ error: 'This invite has already been responded to' }, { status: 409 })
  }

  // If the invite was sent to a specific user, only that user can accept/decline.
  // Phone-based invites have recipientId === null and are claimed by the first signed-in user.
  if (invite.recipientId && invite.recipientId !== session.user.id) {
    return NextResponse.json({ error: 'This invite is for a different user' }, { status: 403 })
  }

  if (status === 'ACCEPTED') {
    const slotRef = adminDb.collection('gameSlots').doc(invite.gameSlotId)
    try {
      await adminDb.runTransaction(async (tx) => {
        const slotSnap = await tx.get(slotRef)
        if (!slotSnap.exists) throw new Error('SLOT_NOT_FOUND')
        const slot = slotSnap.data()!

        const startsAt: Date = slot.startsAt?.toDate?.() ?? new Date(slot.startsAt)
        if (startsAt.getTime() < Date.now()) throw new Error('PAST_GAME')

        const memberRef = slotRef.collection('rosters').doc(session.user.id)
        const memberSnap = await tx.get(memberRef)
        if (!memberSnap.exists) {
          const rosterSnap = await tx.get(slotRef.collection('rosters'))
          if (rosterSnap.size >= slot.capacity) throw new Error('FULL')
          tx.set(memberRef, {
            userId: session.user.id,
            userName: session.user.name,
            joinedAt: FieldValue.serverTimestamp(),
          })
        }
      })
    } catch (e: any) {
      const code = e?.message
      if (code === 'SLOT_NOT_FOUND') return NextResponse.json({ error: 'Game slot not found' }, { status: 404 })
      if (code === 'PAST_GAME') return NextResponse.json({ error: 'This game has already started' }, { status: 409 })
      if (code === 'FULL') return NextResponse.json({ error: 'Game is now full' }, { status: 409 })
      console.error('Invite accept error:', e)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
  }

  // Update invite status and respondedAt
  await inviteDoc.ref.update({
    status,
    recipientId: invite.recipientId ?? session.user.id,
    respondedAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ ok: true, status })
}
