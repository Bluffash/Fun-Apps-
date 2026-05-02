import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const roster = await (prisma as any).gameRoster.findMany({
    where: { gameSlotId: slotId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { joinedAt: 'asc' },
  })
  return NextResponse.json(roster)
}

export async function POST(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slot = await (prisma as any).gameSlot.findUnique({
    where: { id: slotId },
    include: { _count: { select: { rosters: true } } },
  })
  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (slot._count.rosters >= slot.capacity) {
    return NextResponse.json({ error: 'Game is full' }, { status: 409 })
  }

  const existing = await (prisma as any).gameRoster.findUnique({
    where: { gameSlotId_userId: { gameSlotId: slotId, userId: session.user.id } },
  })
  if (existing) return NextResponse.json({ error: 'Already joined' }, { status: 409 })

  const entry = await (prisma as any).gameRoster.create({
    data: { gameSlotId: slotId, userId: session.user.id },
    include: { user: { select: { id: true, name: true } } },
  })
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  await (prisma as any).gameRoster.deleteMany({
    where: { gameSlotId: slotId, userId: session.user.id },
  })
  return NextResponse.json({ ok: true })
}
