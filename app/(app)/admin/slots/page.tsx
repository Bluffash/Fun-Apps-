import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adminDb } from '@/lib/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit } from 'lucide-react'
import { DeleteSlotButton } from '@/components/schedule/DeleteSlotButton'

export default async function AdminSlotsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/schedule')

  const snap = await adminDb.collection('gameSlots').orderBy('startsAt', 'asc').get()

  const slots = await Promise.all(
    snap.docs.map(async (doc) => {
      const data = doc.data()
      const rosterSnap = await adminDb.collection('gameSlots').doc(doc.id).collection('rosters').get()
      return {
        id: doc.id,
        ...data,
        startsAt: data.startsAt instanceof Timestamp ? data.startsAt.toDate() : new Date(data.startsAt),
        rosterCount: rosterSnap.size,
      }
    })
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{slots.length} total slots</p>
        <Link href="/schedule/new">
          <Button><Plus className="w-4 h-4 mr-1" />New Slot</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-card hover:bg-muted/30">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">{(slot as any).sportIcon}</span>
              <div className="min-w-0">
                <div className="font-medium truncate">{(slot as any).title}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(slot.startsAt, 'EEE, MMM d')} · {formatTime(slot.startsAt)} · {(slot as any).location}
                </div>
                <div className="text-xs text-muted-foreground">by {(slot as any).creatorName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary">{slot.rosterCount}/{(slot as any).capacity}</Badge>
              <Link href={`/admin/slots/${slot.id}/edit`}>
                <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
              </Link>
              <DeleteSlotButton slotId={slot.id} />
            </div>
          </div>
        ))}
        {slots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No game slots yet.</div>
        )}
      </div>
    </div>
  )
}
