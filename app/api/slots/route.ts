import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateSlotSchema } from '@/lib/validations'
import { startOfDay, addDays } from 'date-fns'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sportSlug = searchParams.get('sport')
  const weekStart = searchParams.get('weekStart')

  const start = weekStart ? new Date(weekStart) : startOfDay(new Date())
  const end = addDays(start, 7)

  const where: any = {
    startsAt: { gte: start, lt: end },
  }

  if (sportSlug) {
    const sport = await (prisma as any).sport.findUnique({ where: { slug: sportSlug } })
    if (sport) where.sportId = sport.id
  }

  const slots = await (prisma as any).gameSlot.findMany({
    where,
    include: {
      sport: true,
      creator: { select: { id: true, name: true } },
      _count: { select: { rosters: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  return NextResponse.json(slots)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateSlotSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const slot = await (prisma as any).gameSlot.create({
    data: { ...parsed.data, creatorId: session.user.id },
    include: { sport: true, creator: { select: { id: true, name: true } } },
  })

  return NextResponse.json(slot, { status: 201 })
}
