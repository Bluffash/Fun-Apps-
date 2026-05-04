import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await params
  const { role } = await req.json()

  if (role !== 'ADMIN' && role !== 'USER') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const user = await (prisma as any).user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, role: true },
  })

  return NextResponse.json(user)
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

  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  await (prisma as any).user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
