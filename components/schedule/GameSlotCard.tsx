import Link from 'next/link'
import { MapPin, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatTime } from '@/lib/utils'

interface GameSlotCardProps {
  slot: {
    id: string
    title: string
    location: string
    startsAt: string
    endsAt: string
    capacity: number
    sport: { name: string; icon: string }
    _count: { rosters: number }
  }
}

export function GameSlotCard({ slot }: GameSlotCardProps) {
  const filled = slot._count.rosters
  const isFull = filled >= slot.capacity
  const almostFull = filled >= slot.capacity * 0.8

  return (
    <Link href={`/schedule/${slot.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{slot.sport.icon}</span>
              <span className="text-xs font-medium text-muted-foreground">{slot.sport.name}</span>
            </div>
            <Badge
              variant={isFull ? 'destructive' : almostFull ? 'warning' : 'secondary'}
              className="text-xs shrink-0"
            >
              {filled}/{slot.capacity}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2">{slot.title}</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{slot.location}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3 shrink-0" />
              <span>{isFull ? 'Full' : `${slot.capacity - filled} spots left`}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
