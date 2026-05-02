'use client'

import { useState } from 'react'
import { SportPicker } from '@/components/sports/SportPicker'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  sportMap: Record<string, string>
  initialSelected: string[]
}

export function SportPickerProfile({ sportMap, initialSelected }: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSave() {
    if (selected.length === 0) {
      toast({ title: 'Select at least one sport', variant: 'destructive' })
      return
    }
    setLoading(true)
    const res = await fetch('/api/users/me/sports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sportIds: selected }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: 'Sports updated!' })
    } else {
      toast({ title: 'Failed to save', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <SportPicker selected={selected} onChange={setSelected} sportMap={sportMap} />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{selected.length} sport{selected.length !== 1 ? 's' : ''} selected</p>
        <Button onClick={handleSave} disabled={loading || selected.length === 0}>
          {loading ? 'Saving…' : 'Update Sports'}
        </Button>
      </div>
    </div>
  )
}
