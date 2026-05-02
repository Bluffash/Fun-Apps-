import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, gameJoinedEmailHtml } from '@/lib/email'

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
    include: {
      sport: true,
      _count: { select: { rosters: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
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

  // Email the game creator when someone joins (skip if creator joins their own game)
  if (slot.creator.id !== session.user.id && slot.creator.email) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    await sendEmail({
      to: slot.creator.email,
      subject: `${session.user.name} joined your game: ${slot.title}`,
      html: gameJoinedEmailHtml({
        joinerName: session.user.name,
        sportIcon: slot.sport.icon,
        gameTitle: slot.title,
        currentCount: slot._count.rosters + 1,
        capacity: slot.capacity,
        gameUrl: `${appUrl}/schedule/${slotId}`,
      }),
    })
  }

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
