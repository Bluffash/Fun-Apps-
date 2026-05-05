import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { formatDate, formatTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Calendar, Edit } from 'lucide-react'
import { RosterList } from '@/components/schedule/RosterList'
import { JoinLeaveButton } from '@/components/schedule/JoinLeaveButton'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { InviteModal } from '@/components/invite/InviteModal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DeleteSlotButton } from '@/components/schedule/DeleteSlotButton'
import { MapEmbed } from '@/components/schedule/MapEmbed'

export default async function SlotDetailPage({ params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { slotId } = await params

  const slotDoc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!slotDoc.exists) notFound()

  const slot = { id: slotDoc.id, ...slotDoc.data()! }
  const rosterSnap = await adminDb.collection('gameSlots').doc(slotId).collection('rosters').orderBy('joinedAt', 'asc').get()
  const players = rosterSnap.docs.map((d) => ({ id: d.id, name: d.data().userName ?? '' }))

  const isJoined = players.some((p) => p.id === session.user.id)
  const isFull = players.length >= (slot as any).capacity
  const canManage = (slot as any).creatorId === session.user.id || session.user.role === 'ADMIN'

  const startsAt = (slot as any).startsAt?.toDate?.() ?? new Date((slot as any).startsAt)
  const endsAt = (slot as any).endsAt?.toDate?.() ?? new Date((slot as any).endsAt)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{(slot as any).sportIcon}</span>
            <Badge variant="secondary">{(slot as any).sportName}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{(slot as any).title}</h1>
          {(slot as any).description && <p className="text-muted-foreground mt-1">{(slot as any).description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isJoined && <InviteModal slotId={slotId} />}
          <JoinLeaveButton slotId={slotId} isJoined={isJoined} isFull={isFull} />
          {canManage && (
            <>
              <Link href={`/admin/slots/${slotId}/edit`}>
                <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
              </Link>
              <DeleteSlotButton slotId={slotId} />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{formatDate(startsAt, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{formatTime(startsAt)} – {formatTime(endsAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{(slot as any).location}</span>
        </div>
      </div>

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
              <JoinLeaveButton slotId={slotId} isJoined={false} isFull={isFull} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
