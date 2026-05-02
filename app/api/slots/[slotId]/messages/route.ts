import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SendMessageSchema } from '@/lib/validations'

async function assertOnRoster(slotId: string, userId: string) {
  const entry = await (prisma as any).gameRoster.findUnique({
    where: { gameSlotId_userId: { gameSlotId: slotId, userId } },
  })
  return !!entry
}

export async function GET(req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const onRoster = await assertOnRoster(slotId, session.user.id)
  if (!onRoster) return NextResponse.json({ error: 'Must join game to view chat' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  const messages = await (prisma as any).chatMessage.findMany({
    where: { gameSlotId: slotId, ...(cursor ? { id: { lt: cursor } } : {}) },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })
  return NextResponse.json(messages)
}

export async function POST(req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const onRoster = await assertOnRoster(slotId, session.user.id)
  if (!onRoster) return NextResponse.json({ error: 'Must join game to chat' }, { status: 403 })

  const body = await req.json()
  const parsed = SendMessageSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid message' }, { status: 400 })

  const message = await (prisma as any).chatMessage.create({
    data: { gameSlotId: slotId, userId: session.user.id, body: parsed.data.body },
    include: { user: { select: { id: true, name: true } } },
  })
  return NextResponse.json(message, { status: 201 })
}
