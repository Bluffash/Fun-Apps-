'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { initials } from '@/lib/utils'
import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

interface InviteModalProps {
  slotId: string
}

export function InviteModal({ slotId }: InviteModalProps) {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState<string | null>(null)
  const { toast } = useToast()

  const { data, error } = useSWR(
    open ? `/api/users/search?slotId=${slotId}` : null,
    fetcher
  )
  const users: Array<{ id: string; name: string }> = Array.isArray(data) ? data : []

  async function inviteUser(recipientId: string) {
    setSending(recipientId)
    const res = await fetch(`/api/slots/${slotId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'user', recipientId }),
    })
    setSending(null)
    if (res.ok) {
      toast({ title: 'Invite sent!' })
    } else {
      const d = await res.json()
      toast({ title: d.error ?? 'Failed to send invite', variant: 'destructive' })
    }
  }

  async function inviteByPhone(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    setSending('phone')
    const res = await fetch(`/api/slots/${slotId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'phone', phone }),
    })
    setSending(null)
    if (res.ok) {
      toast({ title: 'SMS invite sent!' })
      setPhone('')
    } else {
      const d = await res.json()
      toast({ title: d.error ?? 'Failed to send SMS', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-1" />
          Invite Players
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Players</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="users">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1">Members</TabsTrigger>
            <TabsTrigger value="phone" className="flex-1">By Phone</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-2 mt-3">
            <p className="text-xs text-muted-foreground">
              Users with shared sport interests who aren't on the roster.
            </p>
            {error && (
              <p className="text-center text-sm text-destructive py-6">Couldn't load players. Try again.</p>
            )}
            {!error && users.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No eligible players found</p>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-secondary">{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{user.name}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => inviteUser(user.id)}
                    disabled={sending === user.id}
                  >
                    {sending === user.id ? '…' : 'Invite'}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="phone" className="mt-3">
            <form onSubmit={inviteByPhone} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+12125551234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  E.164 format. They'll receive an SMS with a link to join.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={sending === 'phone' || !phone.trim()}>
                {sending === 'phone' ? 'Sending…' : 'Send SMS Invite'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
