'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSWRConfig } from 'swr'

interface JoinLeaveButtonProps {
  slotId: string
  isJoined: boolean
  isFull: boolean
}

export function JoinLeaveButton({ slotId, isJoined, isFull }: JoinLeaveButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { mutate } = useSWRConfig()

  async function toggle() {
    setLoading(true)
    const method = isJoined ? 'DELETE' : 'POST'
    const res = await fetch(`/api/slots/${slotId}/roster`, { method })
    setLoading(false)

    if (res.ok) {
      mutate(`/api/slots/${slotId}`)
      mutate(`/api/slots/${slotId}/roster`)
      toast({ title: isJoined ? 'Left the game' : 'Joined the game!' })
    } else {
      const data = await res.json()
      toast({ title: data.error ?? 'Something went wrong', variant: 'destructive' })
    }
  }

  if (!isJoined && isFull) {
    return <Button disabled variant="secondary">Game Full</Button>
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant={isJoined ? 'outline' : 'default'}
    >
      {loading ? '…' : isJoined ? 'Leave Game' : 'Join Game'}
    </Button>
  )
}
