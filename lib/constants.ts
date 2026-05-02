export const SPORTS = [
  { slug: 'soccer',            name: 'Soccer',            icon: '⚽' },
  { slug: 'basketball',        name: 'Basketball',        icon: '🏀' },
  { slug: 'pickleball',        name: 'Pickleball',        icon: '🏓' },
  { slug: 'tennis',            name: 'Tennis',            icon: '🎾' },
  { slug: 'volleyball',        name: 'Volleyball',        icon: '🏐' },
  { slug: 'american-football', name: 'American Football', icon: '🏈' },
  { slug: 'baseball',          name: 'Baseball',          icon: '⚾' },
  { slug: 'hockey',            name: 'Hockey',            icon: '🏒' },
  { slug: 'golf',              name: 'Golf',              icon: '⛳' },
  { slug: 'badminton',         name: 'Badminton',         icon: '🏸' },
] as const

export type SportSlug = typeof SPORTS[number]['slug']

export interface LeagueConfig {
  sport: string
  league: string
  name: string
  sportSlug: SportSlug
}

export const LEAGUES: Record<string, LeagueConfig> = {
  'eng.1':          { sport: 'soccer',     league: 'eng.1',          name: 'Premier League',    sportSlug: 'soccer' },
  'esp.1':          { sport: 'soccer',     league: 'esp.1',          name: 'La Liga',            sportSlug: 'soccer' },
  'ita.1':          { sport: 'soccer',     league: 'ita.1',          name: 'Serie A',            sportSlug: 'soccer' },
  'fra.1':          { sport: 'soccer',     league: 'fra.1',          name: 'Ligue 1',            sportSlug: 'soccer' },
  'ger.1':          { sport: 'soccer',     league: 'ger.1',          name: 'Bundesliga',         sportSlug: 'soccer' },
  'uefa.champions': { sport: 'soccer',     league: 'uefa.champions', name: 'Champions League',  sportSlug: 'soccer' },
  'nba':            { sport: 'basketball', league: 'nba',            name: 'NBA',                sportSlug: 'basketball' },
  'nfl':            { sport: 'football',   league: 'nfl',            name: 'NFL',                sportSlug: 'american-football' },
  'mlb':            { sport: 'baseball',   league: 'mlb',            name: 'MLB',                sportSlug: 'baseball' },
  'nhl':            { sport: 'hockey',     league: 'nhl',            name: 'NHL',                sportSlug: 'hockey' },
  'atp':            { sport: 'tennis',     league: 'atp',            name: 'ATP Tour',           sportSlug: 'tennis' },
  'pga':            { sport: 'golf',       league: 'pga',            name: 'PGA Tour',           sportSlug: 'golf' },
}

export const LEAGUES_BY_SPORT: Record<string, Array<{ slug: string } & LeagueConfig>> = {}
for (const [slug, config] of Object.entries(LEAGUES)) {
  const key = config.sportSlug
  if (!LEAGUES_BY_SPORT[key]) LEAGUES_BY_SPORT[key] = []
  LEAGUES_BY_SPORT[key].push({ slug, ...config })
}
