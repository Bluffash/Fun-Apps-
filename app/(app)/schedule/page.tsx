import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { WeeklyScheduleGrid } from '@/components/schedule/WeeklyScheduleGrid'
import { CalendarDays, Users, Flame } from 'lucide-react'

export default async function SchedulePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const userDoc = await adminDb.collection('users').doc(session.user.id).get()
  const userData = userDoc.exists ? userDoc.data()! : {}
  const sportIds: string[] = userData.sportIds ?? []
  if (sportIds.length === 0) redirect('/onboarding')

  // Quick stats for the hero bar
  const now = new Date()
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingSnap = await adminDb
    .collection('gameSlots')
    .where('startsAt', '>=', Timestamp.fromDate(now))
    .where('startsAt', '<', Timestamp.fromDate(weekEnd))
    .get()

  const upcomingCount = upcomingSnap.size
  const sportsActive = new Set(upcomingSnap.docs.map((d) => d.data().sportSlug).filter(Boolean)).size

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero */}
      <div className="hero-gradient dark:hero-gradient-dark rounded-2xl border border-border p-6 sm:p-8 stripe-pattern">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
              Welcome back, {session.user.name?.split(' ')[0]}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Game On. <span className="text-gradient-bold">Any Sport. Any Time.</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Browse pick-up games near you, join your favorites, or create your own.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 glow-soft">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none">{upcomingCount}</div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">This week</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-card border border-border px-4 py-3 glow-soft">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xl font-extrabold leading-none">{sportsActive}</div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Sports active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WeeklyScheduleGrid userId={session.user.id} />
    </div>
  )
}
