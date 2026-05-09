import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.CRICKET_API_KEY
    if (!apiKey) return NextResponse.json([], { status: 200 })

    const res = await fetch(`https://api.cricapi.com/v1/cricScore?apikey=${apiKey}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return NextResponse.json([])

    const data = await res.json()
    const matches = (data.data ?? []).slice(0, 10).map((m: any) => ({
      id: m.id,
      series: m.series,
      matchType: m.matchType?.toUpperCase(),
      status: m.status,
      state: m.ms, // 'fixture' | 'live' | 'result'
      t1: m.t1,
      t2: m.t2,
      t1s: m.t1s,
      t2s: m.t2s,
      t1img: m.t1img,
      t2img: m.t2img,
      dateTimeGMT: m.dateTimeGMT,
    }))

    return NextResponse.json(matches, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch {
    return NextResponse.json([])
  }
}
