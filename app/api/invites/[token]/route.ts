import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await (prisma as any).invite.findUnique({
    where: { token },
    include: {
      gameSlot: { include: { sport: true, _count: { select: { rosters: true } } } },
      sender: { select: { name: true } },
    },
  })
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  return NextResponse.json(invite)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { token } = await params

  const { status } = await req.json()
  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const invite = await (prisma as any).invite.findUnique({ where: { token } })
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })

  await (prisma as any).invite.update({
    where: { token },
    data: { status, respondedAt: new Date(), recipientId: session.user.id },
  })

  if (status === 'ACCEPTED') {
    const slot = await (prisma as any).gameSlot.findUnique({
      where: { id: invite.gameSlotId },
      include: { _count: { select: { rosters: true } } },
    })
    if (slot._count.rosters >= slot.capacity) {
      return NextResponse.json({ error: 'Game is now full' }, { status: 409 })
    }
    await (prisma as any).gameRoster.upsert({
      where: { gameSlotId_userId: { gameSlotId: invite.gameSlotId, userId: session.user.id } },
      create: { gameSlotId: invite.gameSlotId, userId: session.user.id },
      update: {},
    })
  }

  return NextResponse.json({ ok: true })
}
