import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { UpdateSportsSchema } from '@/lib/validations'

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateSportsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  await adminDb.collection('users').doc(session.user.id).update({
    sportIds: parsed.data.sportIds,
  })

  return NextResponse.json({ ok: true })
}
