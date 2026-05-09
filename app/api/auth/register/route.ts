import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

const RegisterBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .nullable()
    .optional(),
})

// Bootstrap endpoint: called right after the session cookie is set, to create
// the Firestore user document. We can't use auth() here because auth() refuses
// any session whose Firestore doc doesn't exist yet — and creating that doc is
// the whole point of this route. Verify the session cookie directly instead.
export async function POST(req: Request) {
  try {
    const sessionCookie = (await cookies()).get('__session')?.value
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let decoded
    try {
      decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let raw: unknown
    try { raw = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
    const parsed = RegisterBodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const userRef = adminDb.collection('users').doc(decoded.uid)
    const existing = await userRef.get()

    // Only seed defaults the first time; merge so we never clobber role/sportIds
    // on a re-register or duplicate call.
    const baseFields = existing.exists
      ? {}
      : {
          role: 'USER',
          sportIds: [],
          createdAt: FieldValue.serverTimestamp(),
        }

    await userRef.set(
      {
        ...baseFields,
        name: parsed.data.name,
        email: decoded.email ?? null,
        phone: parsed.data.phone ?? null,
      },
      { merge: true }
    )

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
