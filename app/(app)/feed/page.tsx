import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { FeedPage } from '@/components/feed/FeedPage'

export default async function FeedPageRoute() {
  const session = await auth()
  if (!session) redirect('/login')

  const doc = await adminDb.collection('users').doc(session.user.id).get()
  const data = doc.exists ? doc.data()! : {}
  const initialFollows: { league: string; sport: string }[] = data.followedLeagues ?? []

  return <FeedPage initialFollows={initialFollows} />
}
