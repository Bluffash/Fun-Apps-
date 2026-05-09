import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000 // 14 days

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json()
    const decoded = await adminAuth.verifyIdToken(idToken)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (userDoc.exists && userDoc.data()?.blocked) {
      return NextResponse.json({ error: 'Your account has been blocked.' }, { status: 403 })
    }
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })
    const response = NextResponse.json({ ok: true })
    response.cookies.set('__session', sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })
    return response
  } catch (err: any) {
    console.error('[session] createSessionCookie failed:', err?.message ?? err)
    return NextResponse.json({ error: err?.message ?? 'Invalid token' }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('__session')
  return response
}
