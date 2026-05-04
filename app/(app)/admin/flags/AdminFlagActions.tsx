'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props {
  messageId: string
}

export function AdminFlagActions({ messageId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function dismiss() {
    setLoading(true)
    await fetch(`/api/admin/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagged: false }),
    })
    setLoading(false)
    router.refresh()
  }

  async function remove() {
    if (!confirm('Delete this message permanently?')) return
    setLoading(true)
    await fetch(`/api/admin/messages/${messageId}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2 mt-2">
      <Button variant="outline" size="sm" disabled={loading} onClick={dismiss}>
        Dismiss Flag
      </Button>
      <Button variant="destructive" size="sm" disabled={loading} onClick={remove}>
        Delete Message
      </Button>
    </div>
  )
}
