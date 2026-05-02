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
  const { repeatWeekly, repeatWeeks, ...slotBody } = body

  const parsed = CreateSlotSchema.safeParse(slotBody)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const weeks = repeatWeekly ? Math.min(Math.max(parseInt(repeatWeeks) || 1, 1), 12) : 1
  const startsAt = new Date(parsed.data.startsAt)
  const endsAt = new Date(parsed.data.endsAt)
  const durationMs = endsAt.getTime() - startsAt.getTime()

  const slots = []
  for (let i = 0; i < weeks; i++) {
    const weekStartsAt = new Date(startsAt.getTime() + i * 7 * 24 * 60 * 60 * 1000)
    const weekEndsAt = new Date(weekStartsAt.getTime() + durationMs)
    const slot = await (prisma as any).gameSlot.create({
      data: {
        ...parsed.data,
        startsAt: weekStartsAt,
        endsAt: weekEndsAt,
        repeatWeekly: !!repeatWeekly,
        creatorId: session.user.id,
      },
      include: { sport: true, creator: { select: { id: true, name: true } } },
    })
    slots.push(slot)
  }

  return NextResponse.json(weeks > 1 ? slots : slots[0], { status: 201 })
}
