import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { SlotForm } from '@/components/schedule/SlotForm'
import { SPORTS } from '@/lib/constants'

export default async function EditSlotPage({ params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { slotId } = await params

  const doc = await adminDb.collection('gameSlots').doc(slotId).get()
  if (!doc.exists) notFound()

  const slot = doc.data()!
  const canEdit = slot.creatorId === session.user.id || session.user.role === 'ADMIN'
  if (!canEdit) redirect('/schedule')

  const sports = SPORTS.map((s) => ({ id: s.slug, slug: s.slug, name: s.name, icon: s.icon }))
  const startsAt = slot.startsAt?.toDate?.() ?? new Date(slot.startsAt)
  const endsAt = slot.endsAt?.toDate?.() ?? new Date(slot.endsAt)

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Game</h1>
        <p className="text-muted-foreground text-sm mt-1">Update the game details.</p>
      </div>
      <SlotForm
        sports={sports}
        initial={{
          id: slotId,
          sportId: slot.sportSlug ?? slot.sportId ?? '',
          title: slot.title ?? '',
          description: slot.description,
          location: slot.location ?? '',
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          capacity: slot.capacity ?? 10,
          repeatWeekly: slot.repeatWeekly ?? false,
        }}
      />
    </div>
  )
}
