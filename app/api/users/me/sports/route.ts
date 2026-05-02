import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateSportsSchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const interests = await (prisma as any).userSport.findMany({
    where: { userId: session.user.id },
    include: { sport: true },
  })
  return NextResponse.json(interests)
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateSportsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { sportIds } = parsed.data
  await (prisma as any).userSport.deleteMany({ where: { userId: session.user.id } })
  if (sportIds.length > 0) {
    await (prisma as any).userSport.createMany({
      data: sportIds.map((sportId: string) => ({ userId: session.user.id, sportId })),
    })
  }

  return NextResponse.json({ ok: true })
}
