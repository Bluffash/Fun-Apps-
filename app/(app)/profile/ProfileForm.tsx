'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface ProfileFormProps {
  initial: { name: string; phone: string; email: string }
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const { toast } = useToast()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/users/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, phone: form.phone }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: 'Profile updated!' })
    } else {
      const d = await res.json()
      toast({ title: d.error ?? 'Failed to update', variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Full name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={form.email} disabled className="opacity-60" />
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>
      <div className="space-y-2">
        <Label>Phone (for SMS invites)</Label>
        <Input
          type="tel"
          placeholder="+12125551234"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">E.164 format. Used when others invite you by phone number.</p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
