'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface JoinLeaveButtonProps {
  slotId: string
  isJoined: boolean
  isFull: boolean
  hasInterest?: boolean
}

export function JoinLeaveButton({ slotId, isJoined: initialJoined, isFull: initialFull, hasInterest = true }: JoinLeaveButtonProps) {
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

  if (!isJoined && !hasInterest) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button disabled variant="secondary">Join Game</Button>
        <Link href="/profile" className="text-xs text-primary hover:underline">
          Add this sport in your profile to join
        </Link>
      </div>
    )
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
