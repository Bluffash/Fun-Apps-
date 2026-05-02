'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface InviteActionsProps {
  token: string
  slotId: string
  isFull: boolean
}

export function InviteActions({ token, slotId, isFull }: InviteActionsProps) {
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)
  const [done, setDone] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function respond(status: 'ACCEPTED' | 'DECLINED') {
    setLoading(status === 'ACCEPTED' ? 'accept' : 'decline')
    const res = await fetch(`/api/invites/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    if (res.ok) {
      setDone(true)
      setAccepted(status === 'ACCEPTED')
      toast({ title: status === 'ACCEPTED' ? 'You joined the game!' : 'Invite declined' })
      router.refresh()
    } else {
      const d = await res.json()
      toast({ title: d.error ?? 'Something went wrong', variant: 'destructive' })
    }
  }

  if (done && accepted) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-green-600 text-sm font-medium">✓ You joined!</span>
        <Link href={`/schedule/${slotId}`}>
          <Button size="sm">View Game →</Button>
        </Link>
      </div>
    )
  }

  if (done && !accepted) {
    return <p className="text-sm text-muted-foreground">Invite declined.</p>
  }

  return (
    <div className="flex gap-2">
      <Button
        className="flex-1"
        onClick={() => respond('ACCEPTED')}
        disabled={!!loading || isFull}
      >
        {loading === 'accept' ? 'Joining…' : isFull ? 'Game Full' : 'Accept'}
      </Button>
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => respond('DECLINED')}
        disabled={!!loading}
      >
        {loading === 'decline' ? 'Declining…' : 'Decline'}
      </Button>
    </div>
  )
}
