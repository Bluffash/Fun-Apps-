import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { UpdateSportsSchema } from '@/lib/validations'
import { SPORTS } from '@/lib/constants'

const VALID_SPORT_SLUGS: Set<string> = new Set(SPORTS.map((s) => s.slug))

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const parsed = UpdateSportsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  // Reject any sport id not in the canonical SPORTS list (prevents arbitrary-string injection
  // that would surface in profile/admin UIs).
  const sportIds = Array.from(new Set(parsed.data.sportIds))
  const invalid = sportIds.filter((s) => !VALID_SPORT_SLUGS.has(s))
  if (invalid.length > 0) {
    return NextResponse.json({ error: `Unknown sport: ${invalid[0]}` }, { status: 400 })
  }

  // set() with merge instead of update() so this works even if the user doc
  // doesn't exist yet (e.g. mid-onboarding edge cases).
  await adminDb.collection('users').doc(session.user.id).set({ sportIds }, { merge: true })

  return NextResponse.json({ ok: true })
}
