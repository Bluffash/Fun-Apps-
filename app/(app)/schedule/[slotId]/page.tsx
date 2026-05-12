import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { GameTime } from '@/components/schedule/GameTime'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Calendar, Edit } from 'lucide-react'
import { SPORTS } from '@/lib/constants'
import { RosterList } from '@/components/schedule/RosterList'
import { JoinLeaveButton } from '@/components/schedule/JoinLeaveButton'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { InviteModal } from '@/components/invite/InviteModal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeleteSlotButton } from '@/components/schedule/DeleteSlotButton'
import { MapEmbed } from '@/components/schedule/MapEmbed'
import { WeatherWidget } from '@/components/schedule/WeatherWidget'
import { getGameWeather } from '@/lib/weather'

export default async function SlotDetailPage({ params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { slotId } = await params

  const slotDoc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!slotDoc.exists) notFound()

  const slot = { id: slotDoc.id, ...slotDoc.data()! }
  const rosterSnap = await adminDb.collection('gameSlots').doc(slotId).collection('rosters').orderBy('joinedAt', 'asc').get()
  const players = rosterSnap.docs.map((d) => ({ id: d.id, name: d.data().userName ?? '' }))

  const userDoc = await adminDb.collection('users').doc(session.user.id).get()
  const userSportIds: string[] = userDoc.data()?.sportIds ?? []

  const isJoined = players.some((p) => p.id === session.user.id)
  const isFull = players.length >= (slot as any).capacity
  const canManage = (slot as any).creatorId === session.user.id || session.user.role === 'ADMIN'
  const hasInterest = !((slot as any).sportSlug) || userSportIds.includes((slot as any).sportSlug)

  const startsAt = (slot as any).startsAt?.toDate?.() ?? new Date((slot as any).startsAt)
  const endsAt = (slot as any).endsAt?.toDate?.() ?? new Date((slot as any).endsAt)

  const weather = await getGameWeather((slot as any).location, startsAt)

  const sport = SPORTS.find((s) => s.slug === (slot as any).sportSlug) ?? SPORTS[0]
  const gradient = sport.color

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
      {/* Hero card */}
      <div className="relative rounded-2xl border bg-card overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />
        <div className={`absolute inset-0 opacity-[0.04] bg-gradient-to-br ${gradient}`} />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-2xl shadow-lg`}>
                  {(slot as any).sportIcon}
                </div>
                <Badge variant="secondary" className="font-bold uppercase tracking-wider text-[10px]">
                  {(slot as any).sportName}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{(slot as any).title}</h1>
              {(slot as any).description && (
                <p className="text-muted-foreground mt-2">{(slot as any).description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isJoined && <InviteModal slotId={slotId} />}
              <JoinLeaveButton slotId={slotId} isJoined={isJoined} isFull={isFull} hasInterest={hasInterest} />
              {canManage && (
                <>
                  <Link href={`/admin/slots/${slotId}/edit`}>
                    <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
                  </Link>
                  <DeleteSlotButton slotId={slotId} redirectTo="/schedule" />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</div>
                <div className="text-sm font-semibold truncate"><GameTime iso={startsAt} timezone={(slot as any).timezone} format="EEE, MMM d" /></div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time</div>
                <div className="text-sm font-semibold truncate">
                  <GameTime iso={startsAt} timezone={(slot as any).timezone} format="h:mm a" />
                  {' – '}
                  <GameTime iso={endsAt} timezone={(slot as any).timezone} format="h:mm a" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</div>
                <div className="text-sm font-semibold truncate">{(slot as any).location}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {weather && <WeatherWidget weather={weather} gameTime={startsAt} timezone={(slot as any).timezone} />}

      <MapEmbed location={(slot as any).location} />
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="font-semibold mb-3">Roster</h2>
          <RosterList players={players} capacity={(slot as any).capacity} currentUserId={session.user.id} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="font-semibold mb-3">Game Chat</h2>
          {isJoined ? (
            <ChatPanel slotId={slotId} currentUserId={session.user.id} isAdmin={canManage} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg bg-muted/30 text-center p-6">
              <p className="text-muted-foreground mb-3">Join this game to access the chat.</p>
              <JoinLeaveButton slotId={slotId} isJoined={false} isFull={isFull} hasInterest={hasInterest} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
