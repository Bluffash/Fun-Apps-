import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { SendMessageSchema } from '@/lib/validations'

async function assertOnRoster(slotId: string, userId: string) {
  const doc = await adminDb.collection('gameSlots').doc(slotId).collection('rosters').doc(userId).get()
  return doc.exists
}

export async function GET(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const onRoster = await assertOnRoster(slotId, session.user.id)
  if (!onRoster) return NextResponse.json({ error: 'Must join game to view chat' }, { status: 403 })

  const isAdmin = session.user.role === 'ADMIN'
  let query = adminDb
    .collection('gameSlots').doc(slotId)
    .collection('messages')
    .orderBy('createdAt', 'asc') as FirebaseFirestore.Query

  if (!isAdmin) {
    query = query.where('flagged', '==', false)
  }

  const snap = await query.get()
  const messages = snap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
    }
  })

  return NextResponse.json(messages)
}

export async function POST(req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const onRoster = await assertOnRoster(slotId, session.user.id)
  if (!onRoster) return NextResponse.json({ error: 'Must join game to chat' }, { status: 403 })

  const body = await req.json()
  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid message' }, { status: 400 })

  const ref = adminDb.collection('gameSlots').doc(slotId).collection('messages').doc()
  await ref.set({
    docId: ref.id,
    slotId,
    userId: session.user.id,
    userName: session.user.name,
    body: parsed.data.body,
    flagged: false,
    createdAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ id: ref.id, ok: true }, { status: 201 })
}
