import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { flagged } = await req.json()

  const message = await (prisma as any).chatMessage.findUnique({ where: { id } })
  if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Any roster member can flag; only admins can unflag
  if (flagged === false && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await (prisma as any).chatMessage.update({
    where: { id },
    data: { flagged },
    include: { user: { select: { id: true, name: true } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params

  await (prisma as any).chatMessage.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
