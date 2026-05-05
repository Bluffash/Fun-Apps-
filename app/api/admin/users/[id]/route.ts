import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  const { role } = await req.json()

  if (role !== 'ADMIN' && role !== 'USER') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const userRef = adminDb.collection('users').doc(id)
  const userDoc = await userRef.get()
  if (!userDoc.exists) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  await userRef.update({ role })

  const updated = userDoc.data()!
  return NextResponse.json({ id, name: updated.name ?? '', role })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  // Delete from Firestore
  await adminDb.collection('users').doc(id).delete()

  // Delete from Firebase Auth
  try {
    await adminAuth.deleteUser(id)
  } catch (err: any) {
    // If the auth user doesn't exist, that's acceptable — Firestore doc is already gone
    if (err?.code !== 'auth/user-not-found') {
      console.error('Error deleting Firebase Auth user:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
