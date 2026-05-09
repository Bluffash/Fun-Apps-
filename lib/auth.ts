import { cookies } from 'next/headers'
import { adminAuth, adminDb } from './firebase-admin'

export interface AppSession {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export async function auth(): Promise<AppSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('__session')?.value
    if (!sessionCookie) return null

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return null

    const data = userDoc.data()!
    if (data.blocked) return null
    return {
      user: {
        id: decoded.uid,
        name: data.name ?? '',
        email: data.email ?? '',
        role: data.role ?? 'USER',
      },
    }
  } catch {
    return null
  }
}
