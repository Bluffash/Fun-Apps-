import { NextResponse } from 'next/server'

const BBC_CRICKET_RSS = 'https://feeds.bbci.co.uk/sport/cricket/rss.xml'

export async function GET() {
  try {
    const res = await fetch(BBC_CRICKET_RSS, {
      next: { revalidate: 120 },
      headers: { 'User-Agent': 'SportsNextUp-App/1.0' },
    })
    if (!res.ok) return NextResponse.json([], { status: 200 })

    const xml = await res.text()

    const items: { headline: string; description: string; published: string; url: string; image: string | null }[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match: RegExpExecArray | null

    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match![1]
      const get = (tag: string) => block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`))?.[1]
        ?? block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`))?.[1]
        ?? null

      const thumbnail = block.match(/media:thumbnail[^>]+url="([^"]+)"/)?.[1] ?? null

      items.push({
        headline: get('title') ?? '',
        description: get('description') ?? '',
        published: get('pubDate') ?? '',
        url: get('link') ?? '',
        image: thumbnail,
      })
      if (items.length >= 8) break
    }

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240' },
    })
  } catch {
    return NextResponse.json([])
  }
}
