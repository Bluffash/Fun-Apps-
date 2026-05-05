import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import { CreateSlotSchema } from '@/lib/validations'

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sportSlug = searchParams.get('sport')
  const weekStart = searchParams.get('weekStart')

  const start = weekStart ? new Date(weekStart) : new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)

  let query = adminDb
    .collection('gameSlots')
    .where('startsAt', '>=', Timestamp.fromDate(start))
    .where('startsAt', '<', Timestamp.fromDate(end))
    .orderBy('startsAt', 'asc') as FirebaseFirestore.Query

  if (sportSlug) {
    query = query.where('sportSlug', '==', sportSlug)
  }

  const snap = await query.get()

  const slots = await Promise.all(
    snap.docs.map(async (doc) => {
      const data = doc.data()
      const rosterSnap = await adminDb.collection('gameSlots').doc(doc.id).collection('rosters').get()
      return {
        id: doc.id,
        ...data,
        startsAt: data.startsAt?.toDate().toISOString(),
        endsAt: data.endsAt?.toDate().toISOString(),
        _count: { rosters: rosterSnap.size },
      }
    })
  )

  return NextResponse.json(slots)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { repeatWeekly, repeatWeeks, ...slotBody } = body

  const parsed = CreateSlotSchema.safeParse(slotBody)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const weeks = repeatWeekly ? Math.min(Math.max(parseInt(repeatWeeks) || 1, 1), 12) : 1
  const startsAt = new Date(parsed.data.startsAt)
  const endsAt = new Date(parsed.data.endsAt)
  const durationMs = endsAt.getTime() - startsAt.getTime()

  const sportDoc = await adminDb.collection('sports').doc(parsed.data.sportId).get()
  const sport = sportDoc.exists ? sportDoc.data()! : { slug: '', name: '', icon: '' }

  const created = []
  for (let i = 0; i < weeks; i++) {
    const weekStartsAt = new Date(startsAt.getTime() + i * 7 * 24 * 60 * 60 * 1000)
    const weekEndsAt = new Date(weekStartsAt.getTime() + durationMs)
    const slotId = newId()

    const slotData = {
      ...parsed.data,
      sportSlug: sport.slug ?? '',
      sportName: sport.name ?? '',
      sportIcon: sport.icon ?? '',
      creatorId: session.user.id,
      creatorName: session.user.name,
      startsAt: Timestamp.fromDate(weekStartsAt),
      endsAt: Timestamp.fromDate(weekEndsAt),
      repeatWeekly: !!repeatWeekly,
      createdAt: FieldValue.serverTimestamp(),
    }
    await adminDb.collection('gameSlots').doc(slotId).set(slotData)
    created.push({ id: slotId, ...slotData, startsAt: weekStartsAt.toISOString(), endsAt: weekEndsAt.toISOString() })
  }

  return NextResponse.json(weeks > 1 ? created : created[0], { status: 201 })
}
