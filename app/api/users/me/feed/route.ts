import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateFeedSchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const follows = await (prisma as any).feedFollow.findMany({
    where: { userId: session.user.id },
  })
  return NextResponse.json(follows)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateFeedSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  await (prisma as any).feedFollow.deleteMany({ where: { userId: session.user.id } })

  if (parsed.data.leagues.length > 0) {
    await (prisma as any).feedFollow.createMany({
      data: parsed.data.leagues.map((l) => ({
        userId: session.user.id,
        league: l.league,
        sport: l.sport,
      })),
    })
  }

  return NextResponse.json({ ok: true })
}
