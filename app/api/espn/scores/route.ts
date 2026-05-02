import { NextResponse } from 'next/server'
import { LEAGUES } from '@/lib/constants'
import { fetchESPNScores, getHomeTeam, getAwayTeam, getGameState } from '@/lib/espn'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const league = searchParams.get('league')
  if (!league || !LEAGUES[league]) {
    return NextResponse.json({ error: 'Invalid league' }, { status: 400 })
  }

  const { sport, league: leaguePath } = LEAGUES[league]
  const games = await fetchESPNScores(sport, leaguePath)

  const simplified = games.slice(0, 10).map((g) => {
    const home = getHomeTeam(g)
    const away = getAwayTeam(g)
    const state = getGameState(g)
    return {
      id: g.id,
      name: g.name,
      date: g.date,
      state,
      statusText: g.status.type.description,
      displayClock: g.status.displayClock,
      period: g.status.period,
      home: home ? { name: home.team.displayName, abbr: home.team.abbreviation, logo: home.team.logo, color: home.team.color, score: home.score } : null,
      away: away ? { name: away.team.displayName, abbr: away.team.abbreviation, logo: away.team.logo, color: away.team.color, score: away.score } : null,
    }
  })

  return NextResponse.json(simplified, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  })
}
