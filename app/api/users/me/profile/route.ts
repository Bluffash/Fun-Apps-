import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { UpdateProfileSchema } from '@/lib/validations'

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

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = UpdateProfileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const updates: Record<string, any> = {}
  if (parsed.data.name !== undefined) updates.name = parsed.data.name
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone || null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true })
  }

  await adminDb.collection('users').doc(session.user.id).update(updates)
  return NextResponse.json({ ok: true })
}
