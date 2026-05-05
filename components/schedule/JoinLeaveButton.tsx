'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface JoinLeaveButtonProps {
  slotId: string
  isJoined: boolean
  isFull: boolean
}

export function JoinLeaveButton({ slotId, isJoined: initialJoined, isFull: initialFull }: JoinLeaveButtonProps) {
  const [loading, setLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(initialJoined)
  const [isFull, setIsFull] = useState(initialFull)
  const { toast } = useToast()
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    const method = isJoined ? 'DELETE' : 'POST'
    const res = await fetch(`/api/slots/${slotId}/roster`, { method })
    setLoading(false)

    if (res.ok) {
      const nowJoined = !isJoined
      setIsJoined(nowJoined)
      if (!nowJoined) setIsFull(false)
      toast({ title: isJoined ? 'Left the game' : 'Joined the game!' })
      router.refresh()
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
