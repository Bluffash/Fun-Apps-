import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { initials } from '@/lib/utils'

interface Player {
  id: string
  name: string
}

interface RosterListProps {
  players: Player[]
  capacity: number
  currentUserId: string
}

export function RosterList({ players, capacity, currentUserId }: RosterListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{players.length} / {capacity} players</span>
        <span className="text-muted-foreground text-xs">{capacity - players.length} spots left</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={`text-xs ${p.id === currentUserId ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {initials(p.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{p.name} {p.id === currentUserId && <span className="text-xs text-muted-foreground">(you)</span>}</span>
          </div>
        ))}
        {Array.from({ length: capacity - players.length }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30" />
            <span className="text-sm text-muted-foreground">Open spot</span>
          </div>
        ))}
      </div>
    </div>
  )
}
