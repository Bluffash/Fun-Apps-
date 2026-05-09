import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import type { DocumentData } from 'firebase-admin/firestore'
import { ProfileForm } from './ProfileForm'
import { SportPickerProfile } from './SportPickerProfile'
import { PushSubscribeButton } from '@/components/push/PushSubscribeButton'
import { formatDate } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SPORTS } from '@/lib/constants'
import { CalendarDays, Trophy, Swords } from 'lucide-react'

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const doc = await adminDb.collection('users').doc(session.user.id).get()
  const user = doc.exists ? doc.data()! : {}

  const sportMap = Object.fromEntries(SPORTS.map((s) => [s.slug, s.slug]))
  const selectedSportIds: string[] = (user as any).sportIds ?? []

  const createdAt = (user as any).createdAt instanceof Timestamp
    ? (user as any).createdAt.toDate()
    : new Date()

  // Fetch all slots and check roster membership in parallel
  const allSlotsSnap = await adminDb.collection('gameSlots').get()
  const rosterChecks = await Promise.all(
    allSlotsSnap.docs.map(async (slotDoc) => {
      const rosterDoc = await adminDb
        .collection('gameSlots').doc(slotDoc.id)
        .collection('rosters').doc(session.user.id).get()
      return rosterDoc.exists ? slotDoc.data() : null
    })
  )
  const joinedSlots = rosterChecks.filter(Boolean) as DocumentData[]

  const createdSlots = allSlotsSnap.docs
    .filter((d) => d.data().creatorId === session.user.id)
    .map((d) => d.data())

  // Sport breakdowns
  const sportCount = (slots: DocumentData[]) => {
    const counts: Record<string, number> = {}
    for (const s of slots) {
      if (s.sportSlug) counts[s.sportSlug] = (counts[s.sportSlug] ?? 0) + 1
    }
    return counts
  }
  const joinedBySport = sportCount(joinedSlots)
  const createdBySport = sportCount(createdSlots)

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-up">
      <div className="hero-gradient dark:hero-gradient-dark rounded-2xl border p-6 stripe-pattern">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg glow-primary">
            {(session.user.name ?? 'U').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">{session.user.role}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{session.user.name}</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Member since {formatDate(createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Personal Info</h2>
        <ProfileForm initial={{
          name: (user as any).name ?? session.user.name,
          phone: (user as any).phone ?? '',
          email: session.user.email,
        }} />
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">My Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{joinedSlots.length}</div>
              <div className="text-xs text-muted-foreground">Games Joined</div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{createdSlots.length}</div>
              <div className="text-xs text-muted-foreground">Games Created</div>
            </div>
          </div>
        </div>

        {Object.keys(joinedBySport).length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Swords className="w-4 h-4" /> Sports You've Played
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(joinedBySport).map(([slug, count]) => {
                const sport = SPORTS.find((s) => s.slug === slug)
                if (!sport) return null
                return (
                  <span key={slug} className="inline-flex items-center gap-1.5 text-sm bg-muted px-3 py-1 rounded-full">
                    {sport.icon} {sport.name}
                    <span className="font-semibold text-primary">{count}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {Object.keys(createdBySport).length > 0 && (
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="w-4 h-4" /> Sports You've Organised
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(createdBySport).map(([slug, count]) => {
                const sport = SPORTS.find((s) => s.slug === slug)
                if (!sport) return null
                return (
                  <span key={slug} className="inline-flex items-center gap-1.5 text-sm bg-muted px-3 py-1 rounded-full">
                    {sport.icon} {sport.name}
                    <span className="font-semibold text-primary">{count}</span>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Sport Interests</h2>
          <p className="text-muted-foreground text-sm mt-1">
            These determine which players you can invite and which games you see first.
          </p>
        </div>
        <SportPickerProfile sportMap={sportMap} initialSelected={selectedSportIds} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Game Notifications</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Get notified when new games are posted for your sports. Works even when the app is closed.
          </p>
        </div>
        <PushSubscribeButton />
      </div>
    </div>
  )
}
