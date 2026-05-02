import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateSlotSchema } from '@/lib/validations'

export async function GET(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slot = await (prisma as any).gameSlot.findUnique({
    where: { id: slotId },
    include: {
      sport: true,
      creator: { select: { id: true, name: true } },
      rosters: { include: { user: { select: { id: true, name: true } } }, orderBy: { joinedAt: 'asc' } },
      _count: { select: { messages: true } },
    },
  })
  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(slot)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slot = await (prisma as any).gameSlot.findUnique({ where: { id: slotId } })
  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const canEdit = slot.creatorId === session.user.id || session.user.role === 'ADMIN'
  if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = UpdateSlotSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const updated = await (prisma as any).gameSlot.update({
    where: { id: slotId },
    data: parsed.data,
    include: { sport: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slot = await (prisma as any).gameSlot.findUnique({ where: { id: slotId } })
  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const canDelete = slot.creatorId === session.user.id || session.user.role === 'ADMIN'
  if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await (prisma as any).gameSlot.delete({ where: { id: slotId } })
  return NextResponse.json({ ok: true })
}
