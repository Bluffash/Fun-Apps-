import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { formatDate, formatTime } from '@/lib/utils'
import { MapPin, Clock, Calendar } from 'lucide-react'
import { InviteAcceptClient } from './InviteAcceptClient'

export default async function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const session = await auth()

  const invite = await (prisma as any).invite.findUnique({
    where: { token },
    include: {
      gameSlot: {
        include: {
          sport: true,
          _count: { select: { rosters: true } },
        },
      },
      sender: { select: { name: true } },
    },
  })
  if (!invite) notFound()

  const slot = invite.gameSlot
  const isFull = slot._count.rosters >= slot.capacity

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <span className="text-5xl">{slot.sport.icon}</span>
          <h1 className="text-2xl font-bold mt-3">You're invited!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="font-semibold">{invite.sender.name}</span> invited you to play {slot.sport.name}
          </p>
        </div>

        <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
          <h2 className="font-semibold">{slot.title}</h2>
          {slot.description && <p className="text-sm text-muted-foreground">{slot.description}</p>}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {formatDate(slot.startsAt, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            {slot.location}
          </div>
          <div className="text-sm text-muted-foreground">
            {slot._count.rosters} / {slot.capacity} players joined
          </div>
        </div>

        <InviteAcceptClient
          token={token}
          inviteStatus={invite.status}
          isFull={isFull}
          isLoggedIn={!!session}
          slotId={slot.id}
          prefilledPhone={invite.phone ?? ''}
        />
      </div>
    </div>
  )
}
