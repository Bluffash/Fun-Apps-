import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const revalidate = 86400

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q || q.trim().length < 3) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 })
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SportsNextUp/1.0 (https://sportsnextup.com)',
        Accept: 'application/json',
      },
      next: { revalidate: 86400 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoder failed' }, { status: 502 })
    }
    const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>
    const first = results[0]
    if (!first) return NextResponse.json({ found: false })
    return NextResponse.json({
      found: true,
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      displayName: first.display_name,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Geocoder unreachable' }, { status: 502 })
  }
}
