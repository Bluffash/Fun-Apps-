import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate, formatTime } from '@/lib/utils'
import { InviteActions } from './InviteActions'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Calendar, Users } from 'lucide-react'

export default async function InvitesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const invites = await (prisma as any).invite.findMany({
    where: { recipientId: session.user.id, status: 'PENDING' },
    include: {
      gameSlot: {
        include: {
          sport: true,
          _count: { select: { rosters: true } },
        },
      },
      sender: { select: { name: true } },
    },
    orderBy: { sentAt: 'desc' },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Invites</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {invites.length === 0 ? 'No pending invites' : `${invites.length} pending invite${invites.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {invites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20">
          <span className="text-5xl mb-4">📬</span>
          <h2 className="text-lg font-semibold mb-1">No pending invites</h2>
          <p className="text-muted-foreground text-sm">When someone invites you to a game, it'll show up here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map((invite: any) => {
            const slot = invite.gameSlot
            const isFull = slot._count.rosters >= slot.capacity
            return (
              <div key={invite.id} className="border rounded-xl p-5 bg-card space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{slot.sport.icon}</span>
                      <Badge variant="secondary">{slot.sport.name}</Badge>
                      {isFull && <Badge variant="destructive">Full</Badge>}
                    </div>
                    <h2 className="font-semibold text-lg">{slot.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Invited by <span className="font-medium text-foreground">{invite.sender.name}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{formatDate(slot.startsAt, 'EEE, MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{formatTime(slot.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{slot.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>{slot._count.rosters}/{slot.capacity} joined</span>
                  </div>
                </div>

                <InviteActions token={invite.token} slotId={slot.id} isFull={isFull} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
