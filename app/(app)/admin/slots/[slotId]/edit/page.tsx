import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SlotForm } from '@/components/schedule/SlotForm'

export default async function EditSlotPage({ params }: { params: Promise<{ slotId: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')
  const { slotId } = await params

  const slot = await (prisma as any).gameSlot.findUnique({ where: { id: slotId } })
  if (!slot) notFound()

  const canEdit = slot.creatorId === session.user.id || session.user.role === 'ADMIN'
  if (!canEdit) redirect('/schedule')

  const sports = await (prisma as any).sport.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Game</h1>
        <p className="text-muted-foreground text-sm mt-1">Update the game details.</p>
      </div>
      <SlotForm sports={sports} initial={{ ...slot, startsAt: slot.startsAt.toISOString(), endsAt: slot.endsAt.toISOString() }} />
    </div>
  )
}
