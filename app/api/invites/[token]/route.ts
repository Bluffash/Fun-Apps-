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

  if (status === 'ACCEPTED') {
    const slotDoc = await adminDb.collection('gameSlots').doc(invite.gameSlotId).get()
    if (!slotDoc.exists) {
      return NextResponse.json({ error: 'Game slot not found' }, { status: 404 })
    }
    const slot = slotDoc.data()!

    const rosterSnap = await adminDb
      .collection('gameSlots')
      .doc(invite.gameSlotId)
      .collection('rosters')
      .get()

    if (rosterSnap.size >= slot.capacity) {
      return NextResponse.json({ error: 'Game is now full' }, { status: 409 })
    }

    // Add user to roster
    await adminDb
      .collection('gameSlots')
      .doc(invite.gameSlotId)
      .collection('rosters')
      .doc(session.user.id)
      .set({
        userId: session.user.id,
        userName: session.user.name,
        joinedAt: FieldValue.serverTimestamp(),
      })
  }

  // Update invite status and respondedAt
  await inviteDoc.ref.update({
    status,
    recipientId: invite.recipientId ?? session.user.id,
    respondedAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ ok: true, status })
}
