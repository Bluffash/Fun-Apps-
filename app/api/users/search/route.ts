import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const gameSlotId = searchParams.get('gameSlotId')
  if (!gameSlotId) return NextResponse.json({ error: 'gameSlotId required' }, { status: 400 })

  const slot = await (prisma as any).gameSlot.findUnique({ where: { id: gameSlotId }, include: { sport: true } })
  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })

  const myInterests = await (prisma as any).userSport.findMany({
    where: { userId: session.user.id },
    select: { sportId: true },
  })
  const mySportIds = myInterests.map((i: any) => i.sportId)

  const onRoster = await (prisma as any).gameRoster.findMany({
    where: { gameSlotId },
    select: { userId: true },
  })
  const pendingInvites = await (prisma as any).invite.findMany({
    where: { gameSlotId, status: 'PENDING', recipientId: { not: null } },
    select: { recipientId: true },
  })

  const excludedIds = [
    session.user.id,
    ...onRoster.map((r: any) => r.userId),
    ...pendingInvites.map((i: any) => i.recipientId),
  ]

  const users = await (prisma as any).user.findMany({
    where: {
      id: { notIn: excludedIds },
      sportInterests: { some: { sportId: { in: [...mySportIds, slot.sportId] } } },
    },
    select: { id: true, name: true, sportInterests: { include: { sport: true } } },
    take: 20,
  })

  return NextResponse.json(users)
}
