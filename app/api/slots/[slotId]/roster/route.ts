import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { sendEmail, gameJoinedEmailHtml } from '@/lib/email'
import { sendPushToUser } from '@/lib/notifications'

export async function GET(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const snap = await adminDb
    .collection('gameSlots').doc(slotId)
    .collection('rosters')
    .orderBy('joinedAt', 'asc')
    .get()

  const roster = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return NextResponse.json(roster)
}

export async function POST(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slotRef = adminDb.collection('gameSlots').doc(slotId)
  const userDoc = await adminDb.collection('users').doc(session.user.id).get()
  const sportIds: string[] = userDoc.data()?.sportIds ?? []

  // All capacity/membership/sport-interest checks run inside a transaction
  // so two simultaneous joins can't overflow capacity.
  let added: { capacity: number; rosterSizeAfter: number; slot: FirebaseFirestore.DocumentData } | null = null
  try {
    added = await adminDb.runTransaction(async (tx) => {
      const slotSnap = await tx.get(slotRef)
      if (!slotSnap.exists) throw new Error('NOT_FOUND')
      const slot = slotSnap.data()!

      // Past game guard
      const startsAt: Date = slot.startsAt?.toDate?.() ?? new Date(slot.startsAt)
      if (startsAt.getTime() < Date.now()) throw new Error('PAST_GAME')

      // Sport interest enforcement (treat missing/empty sportSlug as malformed slot)
      if (!slot.sportSlug) throw new Error('SLOT_MALFORMED')
      if (!sportIds.includes(slot.sportSlug)) throw new Error('NO_INTEREST')

      const memberRef = slotRef.collection('rosters').doc(session.user.id)
      const memberSnap = await tx.get(memberRef)
      if (memberSnap.exists) throw new Error('ALREADY_JOINED')

      const rosterSnap = await tx.get(slotRef.collection('rosters'))
      if (rosterSnap.size >= slot.capacity) throw new Error('FULL')

      tx.set(memberRef, {
        userId: session.user.id,
        userName: session.user.name,
        joinedAt: FieldValue.serverTimestamp(),
      })
      return { capacity: slot.capacity, rosterSizeAfter: rosterSnap.size + 1, slot }
    })
  } catch (e: any) {
    const code = e?.message
    switch (code) {
      case 'NOT_FOUND': return NextResponse.json({ error: 'Not found' }, { status: 404 })
      case 'PAST_GAME': return NextResponse.json({ error: 'This game has already started' }, { status: 409 })
      case 'SLOT_MALFORMED': return NextResponse.json({ error: 'Slot is misconfigured' }, { status: 500 })
      case 'NO_INTEREST': {
        const slotData = (await slotRef.get()).data()
        return NextResponse.json(
          { error: `Add ${slotData?.sportName || 'this sport'} to your profile interests to join this game.` },
          { status: 403 }
        )
      }
      case 'ALREADY_JOINED': return NextResponse.json({ error: 'Already joined' }, { status: 409 })
      case 'FULL': return NextResponse.json({ error: 'Game is full' }, { status: 409 })
      default:
        console.error('Roster join error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
  }

  // Best-effort post-join email (don't fail the join if email service is down)
  if (added.slot.creatorId !== session.user.id) {
    try {
      const creatorDoc = await adminDb.collection('users').doc(added.slot.creatorId).get()
      const creator = creatorDoc.data()
      if (creator?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        await sendEmail({
          to: creator.email,
          subject: `${session.user.name} joined your game: ${added.slot.title}`,
          html: gameJoinedEmailHtml({
            joinerName: session.user.name,
            sportIcon: added.slot.sportIcon,
            gameTitle: added.slot.title,
            currentCount: added.rosterSizeAfter,
            capacity: added.capacity,
            gameUrl: `${appUrl}/schedule/${slotId}`,
          }),
        })
      }
    } catch (e) {
      console.error('Post-join email failed (non-fatal):', e)
    }

    await sendPushToUser(added.slot.creatorId, {
      title: `${added.slot.sportIcon} ${session.user.name} joined your game`,
      body: `${added.slot.title} · ${added.rosterSizeAfter}/${added.capacity}`,
      url: `/schedule/${slotId}`,
    })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slotRef = adminDb.collection('gameSlots').doc(slotId)
  const slotSnap = await slotRef.get()
  if (!slotSnap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const memberRef = slotRef.collection('rosters').doc(session.user.id)
  const memberSnap = await memberRef.get()
  if (!memberSnap.exists) return NextResponse.json({ error: 'Not in roster' }, { status: 404 })

  await memberRef.delete()

  const slot = slotSnap.data()!
  if (slot.creatorId && slot.creatorId !== session.user.id) {
    await sendPushToUser(slot.creatorId, {
      title: `${slot.sportIcon ?? '👋'} ${session.user.name} left your game`,
      body: slot.title ?? 'A player left',
      url: `/schedule/${slotId}`,
    })
  }

  return NextResponse.json({ ok: true })
}
