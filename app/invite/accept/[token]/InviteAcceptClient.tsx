'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface Props {
  token: string
  inviteStatus: string
  isFull: boolean
  isLoggedIn: boolean
  slotId: string
  prefilledPhone: string
}

export function InviteAcceptClient({ token, inviteStatus, isFull, isLoggedIn, slotId, prefilledPhone }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: prefilledPhone, password: '' })

  if (inviteStatus === 'ACCEPTED') {
    return (
      <div className="text-center space-y-3">
        <p className="text-green-600 font-semibold">You&apos;ve already accepted this invite!</p>
        <Button onClick={() => router.push(`/schedule/${slotId}`)} className="w-full">View Game</Button>
      </div>
    )
  }
  if (inviteStatus === 'DECLINED') {
    return <p className="text-center text-muted-foreground">This invite was declined.</p>
  }
  if (isFull) {
    return <p className="text-center text-destructive font-medium">Sorry, this game is now full.</p>
  }

  async function respond(status: 'ACCEPTED' | 'DECLINED') {
    setLoading(true)
    const res = await fetch(`/api/invites/${token}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: status === 'ACCEPTED' ? 'You joined the game!' : 'Invite declined' })
      if (status === 'ACCEPTED') router.push(`/schedule/${slotId}`)
    } else {
      const d = await res.json()
      toast({ title: d.error ?? 'Something went wrong', variant: 'destructive' })
    }
  }

  async function registerAndAccept(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, form.email, form.password)
      await updateProfile(user, { displayName: form.name })
      const idToken = await user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone || null }),
      })
      await respond('ACCEPTED')
    } catch (err: any) {
      toast({ title: err.message ?? 'Registration failed', variant: 'destructive' })
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">Create a free account to join this game.</p>
        <form onSubmit={registerAndAccept} className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input placeholder="Alex Johnson" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Joining…' : 'Create Account & Join Game'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Button className="flex-1" onClick={() => respond('ACCEPTED')} disabled={loading}>
        {loading ? '…' : 'Accept'}
      </Button>
      <Button variant="outline" className="flex-1" onClick={() => respond('DECLINED')} disabled={loading}>
        Decline
      </Button>
    </div>
  )
}
