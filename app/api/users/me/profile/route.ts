import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be E.164 format (e.g. +12125551234)')
    .optional()
    .or(z.literal('')),
})

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await (prisma as any).user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateProfileSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { name, phone } = parsed.data

  if (phone) {
    const existing = await (prisma as any).user.findFirst({
      where: { phone, id: { not: session.user.id } },
    })
    if (existing) return NextResponse.json({ error: 'Phone number already in use' }, { status: 409 })
  }

  const updated = await (prisma as any).user.update({
    where: { id: session.user.id },
    data: {
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
    },
    select: { id: true, name: true, email: true, phone: true },
  })
  return NextResponse.json(updated)
}
