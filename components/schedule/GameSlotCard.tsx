import Link from 'next/link'
import { MapPin, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { GameTime } from './GameTime'
import { SPORTS } from '@/lib/constants'

interface GameSlotCardProps {
  slot: {
    id: string
    title: string
    location: string
    startsAt: string
    endsAt: string
    capacity: number
    sport: { name: string; icon: string }
    sportSlug?: string
    timezone?: string | null
    _count: { rosters: number }
  }
}

export function GameSlotCard({ slot }: GameSlotCardProps) {
  const filled = slot._count.rosters
  const isFull = filled >= slot.capacity
  const almostFull = filled >= slot.capacity * 0.8
  const fillPct = Math.min(100, Math.round((filled / slot.capacity) * 100))

  const sport = SPORTS.find((s) => s.name === slot.sport.name) ?? SPORTS[0]
  const gradient = sport.color

  return (
    <Link href={`/schedule/${slot.id}`}>
      <div className="group relative rounded-xl border bg-card overflow-hidden card-hover cursor-pointer border-border hover:border-primary/40">
        {/* Gradient accent bar */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} text-lg shadow-md`}>
              <span>{slot.sport.icon}</span>
            </div>
            <Badge
              variant={isFull ? 'destructive' : almostFull ? 'warning' : 'secondary'}
              className="text-xs shrink-0 font-bold"
            >
              {filled}/{slot.capacity}
            </Badge>
          </div>

          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            {slot.sport.name}
          </div>
          <h3 className="font-bold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {slot.title}
          </h3>

          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0 text-primary/60" />
              <span className="font-medium">
                <GameTime iso={slot.startsAt} timezone={slot.timezone} format="h:mm a" />
                {' – '}
                <GameTime iso={slot.endsAt} timezone={slot.timezone} format="h:mm a" />
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0 text-primary/60" />
              <span className="truncate">{slot.location}</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                {isFull ? 'Full' : `${slot.capacity - filled} left`}
              </span>
              <span className={isFull ? 'text-destructive' : almostFull ? 'text-orange-500' : 'text-primary'}>
                {fillPct}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
