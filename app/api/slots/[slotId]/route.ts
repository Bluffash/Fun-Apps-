import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { UpdateSlotSchema } from '@/lib/validations'
import { SPORTS } from '@/lib/constants'
import { getRosterUserIds, sendPushToUsers } from '@/lib/notifications'

export async function GET(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const doc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = doc.data()!
  const rosterSnap = await adminDb.collection('gameSlots').doc(slotId).collection('rosters').get()

  return NextResponse.json({
    id: doc.id,
    ...data,
    startsAt: data.startsAt?.toDate().toISOString(),
    endsAt: data.endsAt?.toDate().toISOString(),
    _count: { rosters: rosterSnap.size },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const doc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const slot = doc.data()!
  const canEdit = slot.creatorId === session.user.id || session.user.role === 'ADMIN'
  if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateSlotSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const updates: Record<string, any> = { ...parsed.data }
  if (parsed.data.startsAt) updates.startsAt = Timestamp.fromDate(new Date(parsed.data.startsAt))
  if (parsed.data.endsAt) updates.endsAt = Timestamp.fromDate(new Date(parsed.data.endsAt))
  if (parsed.data.sportId) {
    const sport = SPORTS.find((s) => s.slug === parsed.data.sportId) ?? { slug: '', name: '', icon: '' }
    updates.sportSlug = sport.slug
    updates.sportName = sport.name
    updates.sportIcon = sport.icon
  }

  await adminDb.collection('gameSlots').doc(slotId).update(updates)

  // Notify roster only when something they care about changed.
  const meaningfulFields = ['startsAt', 'endsAt', 'location', 'title']
  const changed = meaningfulFields.filter((f) => parsed.data[f as keyof typeof parsed.data] !== undefined)
  if (changed.length > 0) {
    const recipients = (await getRosterUserIds(slotId)).filter((id) => id !== session.user.id)
    if (recipients.length > 0) {
      await sendPushToUsers(recipients, {
        title: `${slot.sportIcon ?? '✏️'} Game updated: ${updates.title ?? slot.title}`,
        body: `${changed.join(', ')} changed`,
        url: `/schedule/${slotId}`,
      })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const doc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const slot = doc.data()!
  const canDelete = slot.creatorId === session.user.id || session.user.role === 'ADMIN'
  if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Capture roster BEFORE deletion (subcollection lookup still works after, but
  // be defensive in case of cascading rules in the future).
  const recipients = (await getRosterUserIds(slotId)).filter((id) => id !== session.user.id)

  await adminDb.collection('gameSlots').doc(slotId).delete()

  if (recipients.length > 0) {
    await sendPushToUsers(recipients, {
      title: `${slot.sportIcon ?? '❌'} Game cancelled`,
      body: `${slot.title ?? 'Your game'} has been cancelled`,
      url: `/schedule`,
    })
  }

  return NextResponse.json({ ok: true })
}
