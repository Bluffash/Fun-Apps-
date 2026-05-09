import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'

/**
 * Messages are stored at `gameSlots/{slotId}/messages/{msgId}`.
 * When created, each message doc also stores `docId: ref.id` and `slotId` as fields
 * so that this admin route can locate them via a collection group query.
 */

async function findMessageDoc(id: string) {
  const snap = await adminDb
    .collectionGroup('messages')
    .where('docId', '==', id)
    .limit(1)
    .get()
  return snap.empty ? null : snap.docs[0]
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const { flagged } = await req.json()
  if (typeof flagged !== 'boolean') {
    return NextResponse.json({ error: 'flagged must be a boolean' }, { status: 400 })
  }

  const msgDoc = await findMessageDoc(id)
  if (!msgDoc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Admins can flag/unflag anything. Non-admins must be on the roster of the
  // message's slot, and can only flag (not unflag).
  if (session.user.role !== 'ADMIN') {
    if (flagged === false) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const slotId = msgDoc.data()?.slotId
    if (!slotId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const memberSnap = await adminDb
      .collection('gameSlots').doc(slotId)
      .collection('rosters').doc(session.user.id).get()
    if (!memberSnap.exists) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  await msgDoc.ref.update({ flagged })

  const data = msgDoc.data()
  return NextResponse.json({
    id: msgDoc.id,
    ...data,
    flagged,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? data.createdAt ?? null,
    user: { id: data.userId, name: data.userName },
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params

  const msgDoc = await findMessageDoc(id)
  if (!msgDoc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await msgDoc.ref.delete()
  return NextResponse.json({ ok: true })
}
