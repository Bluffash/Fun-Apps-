import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SlotForm } from '@/components/schedule/SlotForm'
import { SPORTS } from '@/lib/constants'

export default async function NewSlotPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const sports = SPORTS.map((s) => ({ id: s.slug, slug: s.slug, name: s.name, icon: s.icon }))

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a Game</h1>
        <p className="text-muted-foreground text-sm mt-1">Schedule a pick-up game for others to join.</p>
      </div>
      <SlotForm sports={sports} />
    </div>
  )
}
