import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { WeeklyScheduleGrid } from '@/components/schedule/WeeklyScheduleGrid'

export default async function SchedulePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const sportCount = await (prisma as any).userSport.count({ where: { userId: session.user.id } })
  if (sportCount === 0) redirect('/onboarding')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Game Schedule</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and join pick-up games near you</p>
      </div>
      <WeeklyScheduleGrid userId={session.user.id} />
    </div>
  )
}
