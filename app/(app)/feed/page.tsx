import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FeedPage } from '@/components/feed/FeedPage'

export default async function FeedPageRoute() {
  const session = await auth()
  if (!session) redirect('/login')

  const follows = await (prisma as any).feedFollow.findMany({
    where: { userId: session.user.id },
    select: { league: true, sport: true },
  })

  return <FeedPage initialFollows={follows} />
}
