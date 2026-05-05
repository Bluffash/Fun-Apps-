import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Called client-side after Firebase Auth creates the user,
// to create the Firestore user document.
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, phone } = await req.json()

    await adminDb.collection('users').doc(session.user.id).set({
      name: name ?? session.user.name,
      email: session.user.email,
      phone: phone ?? null,
      role: 'USER',
      sportIds: [],
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
