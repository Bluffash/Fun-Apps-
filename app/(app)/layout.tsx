import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { adminDb } from '@/lib/firebase-admin'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const inviteSnap = await adminDb
    .collection('invites')
    .where('recipientId', '==', session.user.id)
    .where('status', '==', 'PENDING')
    .get()

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        userName={session.user.name}
        userRole={session.user.role}
        pendingInvites={inviteSnap.size}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  )
}
