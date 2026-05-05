import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const doc = await adminDb.collection('users').doc(session.user.id).get()
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = doc.data()!
  return NextResponse.json({ id: doc.id, name: data.name, email: data.email, phone: data.phone })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, phone } = await req.json()
  const updates: Record<string, any> = {}
  if (name) updates.name = name
  if (phone !== undefined) updates.phone = phone || null

  await adminDb.collection('users').doc(session.user.id).update(updates)
  return NextResponse.json({ ok: true })
}
