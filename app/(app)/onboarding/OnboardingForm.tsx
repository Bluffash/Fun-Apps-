'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SportPicker } from '@/components/sports/SportPicker'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  sportMap: Record<string, string>
}

export function OnboardingForm({ sportMap }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (selected.length === 0) {
      toast({ title: 'Please select at least one sport', variant: 'destructive' })
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
      router.push('/schedule')
    } else {
      toast({ title: 'Failed to save preferences', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <SportPicker selected={selected} onChange={setSelected} sportMap={sportMap} />
      <div className="flex justify-between items-center pt-4">
        <p className="text-sm text-muted-foreground">
          {selected.length} sport{selected.length !== 1 ? 's' : ''} selected
        </p>
        <Button onClick={handleSave} disabled={loading || selected.length === 0}>
          {loading ? 'Saving…' : 'Continue to Schedule →'}
        </Button>
      </div>
    </div>
  )
}
