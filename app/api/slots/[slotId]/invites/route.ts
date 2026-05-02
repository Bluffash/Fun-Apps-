import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SendInviteSchema } from '@/lib/validations'
import { sendSMS } from '@/lib/twilio'
import { sendEmail, inviteEmailHtml } from '@/lib/email'
import { formatDate, formatTime } from '@/lib/utils'

export async function POST(req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slot = await (prisma as any).gameSlot.findUnique({
    where: { id: slotId },
    include: { sport: true },
  })
  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })

  const body = await req.json()
  const parsed = SendInviteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const data = parsed.data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const dateStr = formatDate(slot.startsAt, 'EEE, MMM d')
  const timeStr = formatTime(slot.startsAt)

  if (data.type === 'user') {
    const existing = await (prisma as any).invite.findFirst({
      where: { gameSlotId: slotId, recipientId: data.recipientId, status: 'PENDING' },
    })
    if (existing) return NextResponse.json({ error: 'Already invited' }, { status: 409 })

    const invite = await (prisma as any).invite.create({
      data: { gameSlotId: slotId, senderId: session.user.id, recipientId: data.recipientId },
    })

    // Send email notification to invited user
    const recipient = await (prisma as any).user.findUnique({
      where: { id: data.recipientId },
      select: { email: true, name: true },
    })
    if (recipient?.email) {
      await sendEmail({
        to: recipient.email,
        subject: `${session.user.name} invited you to play ${slot.sport.name}`,
        html: inviteEmailHtml({
          senderName: session.user.name,
          sportName: slot.sport.name,
          sportIcon: slot.sport.icon,
          gameTitle: slot.title,
          location: slot.location,
          dateStr,
          timeStr,
          acceptUrl: `${appUrl}/invites`,
        }),
      })
    }

    return NextResponse.json(invite, { status: 201 })
  }

  // Phone-based invite
  const existingUser = await (prisma as any).user.findUnique({ where: { phone: data.phone } })
  if (existingUser) {
    const invite = await (prisma as any).invite.create({
      data: { gameSlotId: slotId, senderId: session.user.id, recipientId: existingUser.id },
    })
    if (existingUser.email) {
      await sendEmail({
        to: existingUser.email,
        subject: `${session.user.name} invited you to play ${slot.sport.name}`,
        html: inviteEmailHtml({
          senderName: session.user.name,
          sportName: slot.sport.name,
          sportIcon: slot.sport.icon,
          gameTitle: slot.title,
          location: slot.location,
          dateStr,
          timeStr,
          acceptUrl: `${appUrl}/invites`,
        }),
      })
    }
    return NextResponse.json(invite, { status: 201 })
  }

  const invite = await (prisma as any).invite.create({
    data: { gameSlotId: slotId, senderId: session.user.id, phone: data.phone },
  })

  const smsBody = `${session.user.name} invited you to play ${slot.sport.name} on ${dateStr} at ${timeStr} – ${slot.location}. Join: ${appUrl}/invite/accept/${invite.token}`
  await sendSMS(data.phone, smsBody)

  return NextResponse.json(invite, { status: 201 })
}
