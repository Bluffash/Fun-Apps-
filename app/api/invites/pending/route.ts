import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invites = await (prisma as any).invite.findMany({
    where: { recipientId: session.user.id, status: 'PENDING' },
    include: {
      gameSlot: { include: { sport: true } },
      sender: { select: { name: true } },
    },
    orderBy: { sentAt: 'desc' },
  })
  return NextResponse.json(invites)
}
