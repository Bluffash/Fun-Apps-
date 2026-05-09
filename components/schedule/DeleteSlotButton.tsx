'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function DeleteSlotButton({ slotId, redirectTo }: { slotId: string; redirectTo?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleDelete() {
    if (!confirm('Delete this game slot? This cannot be undone.')) return
    setLoading(true)
    const res = await fetch(`/api/slots/${slotId}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      toast({ title: 'Game deleted' })
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    } else {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleDelete} disabled={loading} className="text-destructive hover:text-destructive">
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
