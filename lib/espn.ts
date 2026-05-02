const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'

export interface ESPNTeam {
  displayName: string
  abbreviation: string
  logo: string
  color: string
}

export interface ESPNCompetitor {
  homeAway: 'home' | 'away'
  team: ESPNTeam
  score: string
}

export interface ESPNGame {
  id: string
  name: string
  shortName: string
  date: string
  status: {
    type: {
      state: 'pre' | 'in' | 'post'
      completed: boolean
      description: string
    }
    displayClock: string
    period: number
  }
  competitions: Array<{
    competitors: ESPNCompetitor[]
    venue?: { fullName: string; address?: { city: string; state: string } }
    broadcasts?: Array<{ names: string[] }>
  }>
}

export interface ESPNArticle {
  headline: string
  description: string
  published: string
  images: Array<{ url: string; caption?: string }>
  links: { web: { href: string } }
  categories?: Array<{ description: string }>
}

export async function fetchESPNScores(sport: string, league: string): Promise<ESPNGame[]> {
  try {
    const url = `${ESPN_BASE}/${sport}/${league}/scoreboard`
    const res = await fetch(url, { next: { revalidate: 30 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.events ?? []
  } catch {
    return []
  }
}

export async function fetchESPNNews(sport: string, league: string): Promise<ESPNArticle[]> {
  try {
    const url = `${ESPN_BASE}/${sport}/${league}/news`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.articles ?? []
  } catch {
    return []
  }
}

export function getHomeTeam(game: ESPNGame): ESPNCompetitor | undefined {
  return game.competitions[0]?.competitors.find((c) => c.homeAway === 'home')
}

export function getAwayTeam(game: ESPNGame): ESPNCompetitor | undefined {
  return game.competitions[0]?.competitors.find((c) => c.homeAway === 'away')
}

export function getGameState(game: ESPNGame) {
  const state = game.status.type.state
  if (state === 'in') return 'live'
  if (state === 'post') return 'final'
  return 'upcoming'
}
