import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/utils'

interface Team {
  name: string
  abbr: string
  logo: string | null
  color: string
  score: string
}

interface ScoreCardProps {
  game: {
    id: string
    name: string
    date: string
    state: 'live' | 'final' | 'upcoming'
    statusText: string
    displayClock: string
    period: number
    home: Team | null
    away: Team | null
  }
}

export function ScoreCard({ game }: ScoreCardProps) {
  const { home, away, state, statusText } = game
  if (!home || !away) return null

  const statusVariant = state === 'live' ? 'success' : state === 'final' ? 'secondary' : 'outline'

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-center justify-between">
        <Badge variant={statusVariant} className="text-xs">
          {state === 'live' ? `🔴 ${statusText}` : statusText}
        </Badge>
        {state === 'upcoming' && (
          <span className="text-xs text-muted-foreground">{formatTime(game.date)}</span>
        )}
      </div>

      <div className="space-y-1.5">
        {[away, home].map((team, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
              ) : (
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: `#${team.color || 'ccc'}` }}
                />
              )}
              <span className="text-sm font-medium">{team.abbr}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[100px]">{team.name}</span>
            </div>
            <span className={`text-lg font-bold tabular-nums ${state === 'upcoming' ? 'text-muted-foreground text-sm' : ''}`}>
              {state === 'upcoming' ? '-' : team.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
