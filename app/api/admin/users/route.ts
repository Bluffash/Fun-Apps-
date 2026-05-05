import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const snap = await adminDb.collection('users').orderBy('createdAt', 'asc').get()

  const users = snap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? null,
      role: data.role ?? 'USER',
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt ?? null,
      // Cross-collection counts require extra queries per user — returning 0 for now
      _count: { gameRosters: 0 },
    }
  })

  return NextResponse.json(users)
}
