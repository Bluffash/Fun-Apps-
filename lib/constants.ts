export const SPORTS = [
  { slug: 'soccer',            name: 'Soccer',            icon: '⚽', color: 'from-emerald-500 to-green-600',   tint: 'bg-emerald-50 dark:bg-emerald-950/30',  ring: 'ring-emerald-500/30' },
  { slug: 'basketball',        name: 'Basketball',        icon: '🏀', color: 'from-orange-500 to-red-500',      tint: 'bg-orange-50 dark:bg-orange-950/30',    ring: 'ring-orange-500/30' },
  { slug: 'pickleball',        name: 'Pickleball',        icon: '🏓', color: 'from-pink-500 to-rose-600',       tint: 'bg-pink-50 dark:bg-pink-950/30',        ring: 'ring-pink-500/30' },
  { slug: 'tennis',            name: 'Tennis',            icon: '🎾', color: 'from-yellow-400 to-lime-500',     tint: 'bg-lime-50 dark:bg-lime-950/30',        ring: 'ring-lime-500/30' },
  { slug: 'volleyball',        name: 'Volleyball',        icon: '🏐', color: 'from-amber-400 to-orange-500',    tint: 'bg-amber-50 dark:bg-amber-950/30',      ring: 'ring-amber-500/30' },
  { slug: 'american-football', name: 'American Football', icon: '🏈', color: 'from-amber-700 to-stone-700',     tint: 'bg-amber-50 dark:bg-amber-950/30',      ring: 'ring-amber-700/30' },
  { slug: 'baseball',          name: 'Baseball',          icon: '⚾', color: 'from-red-500 to-rose-600',        tint: 'bg-red-50 dark:bg-red-950/30',          ring: 'ring-red-500/30' },
  { slug: 'hockey',            name: 'Hockey',            icon: '🏒', color: 'from-cyan-500 to-blue-600',       tint: 'bg-cyan-50 dark:bg-cyan-950/30',        ring: 'ring-cyan-500/30' },
  { slug: 'golf',              name: 'Golf',              icon: '⛳', color: 'from-green-500 to-emerald-600',   tint: 'bg-green-50 dark:bg-green-950/30',      ring: 'ring-green-500/30' },
  { slug: 'badminton',         name: 'Badminton',         icon: '🏸', color: 'from-violet-500 to-purple-600',   tint: 'bg-violet-50 dark:bg-violet-950/30',    ring: 'ring-violet-500/30' },
  { slug: 'cricket',           name: 'Cricket',           icon: '🏏', color: 'from-blue-500 to-indigo-600',     tint: 'bg-blue-50 dark:bg-blue-950/30',        ring: 'ring-blue-500/30' },
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
  'cricket':        { sport: 'cricket',    league: 'cricket',        name: 'Cricket',            sportSlug: 'cricket' },
}

export const LEAGUES_BY_SPORT: Record<string, Array<{ slug: string } & LeagueConfig>> = {}
for (const [slug, config] of Object.entries(LEAGUES)) {
  const key = config.sportSlug
  if (!LEAGUES_BY_SPORT[key]) LEAGUES_BY_SPORT[key] = []
  LEAGUES_BY_SPORT[key].push({ slug, ...config })
}
