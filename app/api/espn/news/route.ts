import { NextResponse } from 'next/server'
import { LEAGUES } from '@/lib/constants'
import { fetchESPNNews } from '@/lib/espn'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const league = searchParams.get('league')
  if (!league || !LEAGUES[league]) {
    return NextResponse.json({ error: 'Invalid league' }, { status: 400 })
  }

  const { sport, league: leaguePath } = LEAGUES[league]
  const articles = await fetchESPNNews(sport, leaguePath)

  const simplified = articles.slice(0, 8).map((a) => ({
    headline: a.headline,
    description: a.description,
    published: a.published,
    image: a.images?.[0]?.url ?? null,
    url: a.links?.web?.href ?? null,
    tag: a.categories?.[0]?.description ?? null,
  }))

  return NextResponse.json(simplified, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
