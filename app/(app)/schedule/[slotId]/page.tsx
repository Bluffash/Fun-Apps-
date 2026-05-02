import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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

export default async function SlotDetailPage({ params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { slotId } = await params

  const slot = await (prisma as any).gameSlot.findUnique({
    where: { id: slotId },
    include: {
      sport: true,
      creator: { select: { id: true, name: true } },
      rosters: { include: { user: { select: { id: true, name: true } } }, orderBy: { joinedAt: 'asc' } },
    },
  })
  if (!slot) notFound()

  const players = slot.rosters.map((r: any) => r.user)
  const isJoined = players.some((p: any) => p.id === session.user.id)
  const isFull = players.length >= slot.capacity
  const canManage = slot.creatorId === session.user.id || session.user.role === 'ADMIN'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{slot.sport.icon}</span>
            <Badge variant="secondary">{slot.sport.name}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{slot.title}</h1>
          {slot.description && <p className="text-muted-foreground mt-1">{slot.description}</p>}
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

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{formatDate(slot.startsAt, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span>{slot.location}</span>
        </div>
      </div>

      <Separator />

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster */}
        <div className="lg:col-span-1">
          <h2 className="font-semibold mb-3">Roster</h2>
          <RosterList players={players} capacity={slot.capacity} currentUserId={session.user.id} />
        </div>

        {/* Chat */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold mb-3">Game Chat</h2>
          {isJoined ? (
            <ChatPanel slotId={slotId} currentUserId={session.user.id} />
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
