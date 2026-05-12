import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { GameTime } from '@/components/schedule/GameTime'
import { MapPin, Clock, Calendar } from 'lucide-react'
import { InviteAcceptClient } from './InviteAcceptClient'

export default async function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const session = await auth()

  const snap = await adminDb.collection('invites').where('token', '==', token).limit(1).get()
  if (snap.empty) notFound()

  const inviteDoc = snap.docs[0]
  const invite = inviteDoc.data()

  const slotDoc = await adminDb.collection('gameSlots').doc(invite.gameSlotId).get()
  if (!slotDoc.exists) notFound()

  const slot = slotDoc.data()!
  const rosterSnap = await adminDb.collection('gameSlots').doc(invite.gameSlotId).collection('rosters').get()
  const isFull = rosterSnap.size >= slot.capacity

  const startsAt = slot.startsAt instanceof Timestamp ? slot.startsAt.toDate() : new Date(slot.startsAt)
  const endsAt = slot.endsAt instanceof Timestamp ? slot.endsAt.toDate() : new Date(slot.endsAt)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <span className="text-5xl">{slot.sportIcon}</span>
          <h1 className="text-2xl font-bold mt-3">You&apos;re invited!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="font-semibold">{invite.senderName}</span> invited you to play {slot.sportName}
          </p>
        </div>

        <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
          <h2 className="font-semibold">{slot.title}</h2>
          {slot.description && <p className="text-sm text-muted-foreground">{slot.description}</p>}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <GameTime iso={startsAt} timezone={(slot.timezone as string | undefined) ?? null} format="EEEE, MMMM d, yyyy" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <GameTime iso={startsAt} timezone={(slot.timezone as string | undefined) ?? null} format="h:mm a" />
            {' – '}
            <GameTime iso={endsAt} timezone={(slot.timezone as string | undefined) ?? null} format="h:mm a" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            {slot.location}
          </div>
          <div className="text-sm text-muted-foreground">
            {rosterSnap.size} / {slot.capacity} players joined
          </div>
        </div>

        <InviteAcceptClient
          token={token}
          inviteStatus={invite.status}
          isFull={isFull}
          isLoggedIn={!!session}
          slotId={invite.gameSlotId}
          prefilledPhone={invite.phone ?? ''}
        />
      </div>
    </div>
  )
}
