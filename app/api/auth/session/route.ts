import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000 // 14 days

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json()
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })
    const cookieStore = await cookies()
    cookieStore.set('__session', sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[session] createSessionCookie failed:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('__session')
  return NextResponse.json({ ok: true })
}
