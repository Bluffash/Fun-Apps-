import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit } from 'lucide-react'
import { DeleteSlotButton } from '@/components/schedule/DeleteSlotButton'

export default async function AdminSlotsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/schedule')

  const slots = await (prisma as any).gameSlot.findMany({
    include: {
      sport: true,
      creator: { select: { name: true } },
      _count: { select: { rosters: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin — All Games</h1>
          <p className="text-muted-foreground text-sm">{slots.length} total slots</p>
        </div>
        <Link href="/schedule/new">
          <Button><Plus className="w-4 h-4 mr-1" />New Slot</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {slots.map((slot: any) => (
          <div key={slot.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card hover:bg-muted/30">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">{slot.sport.icon}</span>
              <div className="min-w-0">
                <div className="font-medium truncate">{slot.title}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(slot.startsAt, 'EEE, MMM d')} · {formatTime(slot.startsAt)} · {slot.location}
                </div>
                <div className="text-xs text-muted-foreground">by {slot.creator.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary">{slot._count.rosters}/{slot.capacity}</Badge>
              <Link href={`/admin/slots/${slot.id}/edit`}>
                <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
              </Link>
              <DeleteSlotButton slotId={slot.id} />
            </div>
          </div>
        ))}
        {slots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No game slots yet.</div>
        )}
      </div>
    </div>
  )
}
