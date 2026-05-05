import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const snap = await adminDb
    .collection('invites')
    .where('recipientId', '==', session.user.id)
    .where('status', '==', 'PENDING')
    .get()

  return NextResponse.json({ count: snap.size })
}
