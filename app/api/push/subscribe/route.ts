import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { createHash } from 'crypto'

// Use a hash of the push endpoint as the doc id so each device has its own
// subscription record (otherwise a second device would overwrite the first).
function endpointDocId(endpoint: string) {
  return createHash('sha256').update(endpoint).digest('hex').slice(0, 32)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscription = await req.json()
  if (!subscription?.endpoint || typeof subscription.endpoint !== 'string') {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  await adminDb
    .collection('users')
    .doc(session.user.id)
    .collection('pushSubscriptions')
    .doc(endpointDocId(subscription.endpoint))
    .set({ subscription, updatedAt: new Date() })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let endpoint: string | undefined
  try {
    const body = await req.json()
    endpoint = body?.endpoint
  } catch {
    // No body — fall through to delete-all-for-user.
  }

  const subsRef = adminDb.collection('users').doc(session.user.id).collection('pushSubscriptions')
  if (endpoint) {
    await subsRef.doc(endpointDocId(endpoint)).delete()
  } else {
    // Backwards-compat / "unsubscribe everywhere": delete all subs for this user.
    const snap = await subsRef.get()
    await Promise.all(snap.docs.map((d) => d.ref.delete()))
  }

  return NextResponse.json({ ok: true })
}
