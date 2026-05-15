import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import { SendInviteSchema } from '@/lib/validations'
import { sendSMS } from '@/lib/twilio'
import { sendEmail, inviteEmailHtml } from '@/lib/email'
import { formatDate, formatTime } from '@/lib/utils'
import { sendPushToUser } from '@/lib/notifications'

export async function POST(req: Request, { params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slotId } = await params

  const slotDoc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!slotDoc.exists) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  const slot = slotDoc.data()!

  const body = await req.json()
  const parsed = SendInviteSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const data = parsed.data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const startsAt = (slot.startsAt as Timestamp).toDate()
  const dateStr = formatDate(startsAt, 'EEE, MMM d')
  const timeStr = formatTime(startsAt)

  if (data.type === 'user') {
    // Check for existing PENDING invite for this recipient + slot
    const existingSnap = await adminDb
      .collection('invites')
      .where('gameSlotId', '==', slotId)
      .where('recipientId', '==', data.recipientId)
      .where('status', '==', 'PENDING')
      .limit(1)
      .get()

    if (!existingSnap.empty) {
      return NextResponse.json({ error: 'Already invited' }, { status: 409 })
    }

    const token = adminDb.collection('invites').doc().id
    const inviteRef = adminDb.collection('invites').doc(token)
    const inviteData = {
      gameSlotId: slotId,
      senderId: session.user.id,
      senderName: session.user.name,
      recipientId: data.recipientId,
      phone: null,
      status: 'PENDING',
      token,
      sentAt: FieldValue.serverTimestamp(),
      respondedAt: null,
    }
    await inviteRef.set(inviteData)

    await sendPushToUser(data.recipientId, {
      title: `${slot.sportIcon} ${session.user.name} invited you`,
      body: `${slot.title} · ${dateStr} ${timeStr}`,
      url: `/invites`,
    })

    // Send email to invited user
    const recipientDoc = await adminDb.collection('users').doc(data.recipientId).get()
    if (recipientDoc.exists) {
      const recipient = recipientDoc.data()!
      if (recipient.email) {
        await sendEmail({
          to: recipient.email,
          subject: `${session.user.name} invited you to play ${slot.sportName}`,
          html: inviteEmailHtml({
            senderName: session.user.name,
            sportName: slot.sportName,
            sportIcon: slot.sportIcon,
            gameTitle: slot.title,
            location: slot.location,
            dateStr,
            timeStr,
            acceptUrl: `${appUrl}/invites`,
          }),
        })
      }
    }

    return NextResponse.json({ id: token, ...inviteData, sentAt: new Date().toISOString() }, { status: 201 })
  }

  // Phone-based invite
  const phoneSnap = await adminDb
    .collection('users')
    .where('phone', '==', data.phone)
    .limit(1)
    .get()

  if (!phoneSnap.empty) {
    // Existing user — treat as user invite
    const existingUser = phoneSnap.docs[0]
    const token = adminDb.collection('invites').doc().id
    const inviteRef = adminDb.collection('invites').doc(token)
    const inviteData = {
      gameSlotId: slotId,
      senderId: session.user.id,
      senderName: session.user.name,
      recipientId: existingUser.id,
      phone: null,
      status: 'PENDING',
      token,
      sentAt: FieldValue.serverTimestamp(),
      respondedAt: null,
    }
    await inviteRef.set(inviteData)

    await sendPushToUser(existingUser.id, {
      title: `${slot.sportIcon} ${session.user.name} invited you`,
      body: `${slot.title} · ${dateStr} ${timeStr}`,
      url: `/invites`,
    })

    const userData = existingUser.data()
    if (userData.email) {
      await sendEmail({
        to: userData.email,
        subject: `${session.user.name} invited you to play ${slot.sportName}`,
        html: inviteEmailHtml({
          senderName: session.user.name,
          sportName: slot.sportName,
          sportIcon: slot.sportIcon,
          gameTitle: slot.title,
          location: slot.location,
          dateStr,
          timeStr,
          acceptUrl: `${appUrl}/invites`,
        }),
      })
    }

    return NextResponse.json({ id: token, ...inviteData, sentAt: new Date().toISOString() }, { status: 201 })
  }

  // Unknown phone — send SMS with deeplink token
  const token = adminDb.collection('invites').doc().id
  const inviteRef = adminDb.collection('invites').doc(token)
  const inviteData = {
    gameSlotId: slotId,
    senderId: session.user.id,
    senderName: session.user.name,
    recipientId: null,
    phone: data.phone,
    status: 'PENDING',
    token,
    sentAt: FieldValue.serverTimestamp(),
    respondedAt: null,
  }
  await inviteRef.set(inviteData)

  const smsBody = `${session.user.name} invited you to play ${slot.sportName} on ${dateStr} at ${timeStr} – ${slot.location}. Join: ${appUrl}/invite/accept/${token}`
  await sendSMS(data.phone, smsBody)

  return NextResponse.json({ id: token, ...inviteData, sentAt: new Date().toISOString() }, { status: 201 })
}
