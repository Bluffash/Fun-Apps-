import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { sendEmail, gameJoinedEmailHtml } from '@/lib/email'

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

  const slotDoc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!slotDoc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const slot = slotDoc.data()!

  const rosterSnap = await adminDb.collection('gameSlots').doc(slotId).collection('rosters').get()
  if (rosterSnap.size >= slot.capacity) {
    return NextResponse.json({ error: 'Game is full' }, { status: 409 })
  }

  const memberDoc = await adminDb.collection('gameSlots').doc(slotId).collection('rosters').doc(session.user.id).get()
  if (memberDoc.exists) return NextResponse.json({ error: 'Already joined' }, { status: 409 })

  await adminDb.collection('gameSlots').doc(slotId).collection('rosters').doc(session.user.id).set({
    userId: session.user.id,
    userName: session.user.name,
    joinedAt: FieldValue.serverTimestamp(),
  })

  if (slot.creatorId !== session.user.id) {
    const creatorDoc = await adminDb.collection('users').doc(slot.creatorId).get()
    const creator = creatorDoc.data()
    if (creator?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      await sendEmail({
        to: creator.email,
        subject: `${session.user.name} joined your game: ${slot.title}`,
        html: gameJoinedEmailHtml({
          joinerName: session.user.name,
          sportIcon: slot.sportIcon,
          gameTitle: slot.title,
          currentCount: rosterSnap.size + 1,
          capacity: slot.capacity,
          gameUrl: `${appUrl}/schedule/${slotId}`,
        }),
      })
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  await adminDb.collection('gameSlots').doc(slotId).collection('rosters').doc(session.user.id).delete()
  return NextResponse.json({ ok: true })
}
