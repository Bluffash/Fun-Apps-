'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  currentRole: string
  blocked: boolean
  isSelf: boolean
}

export function AdminUserActions({ userId, currentRole, blocked, isSelf }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function setRole(role: string) {
    setLoading(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    setLoading(false)
    router.refresh()
  }

  async function toggleBlock() {
    if (!blocked && !confirm(`Block this user? They will be signed out and unable to log in.`)) return
    setLoading(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked: !blocked }),
    })
    setLoading(false)
    router.refresh()
  }

  async function removeUser() {
    if (!confirm('Remove this user? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!isSelf && currentRole === 'USER' && !blocked && (
        <Button variant="outline" size="sm" disabled={loading} onClick={() => setRole('ADMIN')}>
          Make Admin
        </Button>
      )}
      {!isSelf && currentRole === 'ADMIN' && (
        <Button variant="outline" size="sm" disabled={loading} onClick={() => setRole('USER')}>
          Revoke Admin
        </Button>
      )}
      {!isSelf && (
        <Button
          variant={blocked ? 'outline' : 'secondary'}
          size="sm"
          disabled={loading}
          onClick={toggleBlock}
        >
          {blocked ? 'Unblock' : 'Block'}
        </Button>
      )}
      {!isSelf && (
        <Button variant="destructive" size="sm" disabled={loading} onClick={removeUser}>
          Remove
        </Button>
      )}
      {isSelf && <span className="text-xs text-muted-foreground">You</span>}
    </div>
  )
}
