'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { LeaguePicker } from './LeaguePicker'
import { ScoreCard } from './ScoreCard'
import { NewsCard } from './NewsCard'
import { LEAGUES } from '@/lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Follow {
  league: string
  sport: string
}

interface FeedPageProps {
  initialFollows: Follow[]
}

function LeagueFeed({ leagueSlug }: { leagueSlug: string }) {
  const league = LEAGUES[leagueSlug]
  const { data: scores = [] } = useSWR(`/api/espn/scores?league=${leagueSlug}`, fetcher, { refreshInterval: 30000 })
  const { data: news = [] } = useSWR(`/api/espn/news?league=${leagueSlug}`, fetcher, { refreshInterval: 120000 })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{league?.name}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scores */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Scores</h3>
          <div className="space-y-2">
            {scores.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">No scores available</p>
            ) : (
              scores.map((g: any) => <ScoreCard key={g.id} game={g} />)
            )}
          </div>
        </div>
        {/* News */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">News</h3>
          <div className="space-y-2">
            {news.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">No news available</p>
            ) : (
              news.map((a: any, i: number) => <NewsCard key={i} article={a} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeedPage({ initialFollows }: FeedPageProps) {
  const [follows, setFollows] = useState<Follow[]>(initialFollows)

  if (follows.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">News & Scores</h1>
            <p className="text-muted-foreground text-sm">Follow leagues to see live scores and news.</p>
          </div>
          <LeaguePicker followed={follows} onSave={setFollows} />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">📺</span>
          <h2 className="text-xl font-semibold mb-2">No leagues followed</h2>
          <p className="text-muted-foreground mb-6">Click "Manage Leagues" to follow your favorite leagues.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">News & Scores</h1>
          <p className="text-muted-foreground text-sm">Live scores and latest news from your leagues.</p>
        </div>
        <LeaguePicker followed={follows} onSave={setFollows} />
      </div>

      <Tabs defaultValue={follows[0]?.league}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {follows.map((f) => (
            <TabsTrigger key={f.league} value={f.league} className="text-xs">
              {LEAGUES[f.league]?.name ?? f.league}
            </TabsTrigger>
          ))}
        </TabsList>
        {follows.map((f) => (
          <TabsContent key={f.league} value={f.league} className="mt-4">
            <LeagueFeed leagueSlug={f.league} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
