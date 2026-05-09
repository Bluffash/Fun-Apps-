import Image from 'next/image'

interface CricketMatch {
  id: string
  series: string
  matchType: string
  status: string
  state: string
  t1: string
  t2: string
  t1s: string
  t2s: string
  t1img: string
  t2img: string
  dateTimeGMT: string
}

export function CricketScoreCard({ match }: { match: CricketMatch }) {
  const isLive = match.state === 'live'
  const isResult = match.state === 'result'

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground truncate">{match.series}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          isLive ? 'bg-red-500/10 text-red-500' :
          isResult ? 'bg-muted text-muted-foreground' :
          'bg-primary/10 text-primary'
        }`}>
          {isLive ? '● LIVE' : isResult ? 'Result' : match.matchType}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {match.t1img && (
              <img src={match.t1img} alt={match.t1} className="w-6 h-6 object-contain" />
            )}
            <span className="text-sm font-medium">{match.t1}</span>
          </div>
          {match.t1s && <span className="text-sm font-bold tabular-nums">{match.t1s}</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {match.t2img && (
              <img src={match.t2img} alt={match.t2} className="w-6 h-6 object-contain" />
            )}
            <span className="text-sm font-medium">{match.t2}</span>
          </div>
          {match.t2s && <span className="text-sm font-bold tabular-nums">{match.t2s}</span>}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{match.status}</p>
    </div>
  )
}
