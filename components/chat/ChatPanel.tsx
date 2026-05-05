'use client'

import { useRef, useEffect, useState } from 'react'
import useSWR from 'swr'
import { Send, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { timeAgo, initials } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ChatMessage {
  id: string
  body: string
  flagged: boolean
  createdAt: string
  user: { id: string; name: string }
}

interface ChatPanelProps {
  slotId: string
  currentUserId: string
  isAdmin?: boolean
}

export function ChatPanel({ slotId, currentUserId, isAdmin = false }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [flagging, setFlagging] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages = [], mutate } = useSWR<ChatMessage[]>(
    `/api/slots/${slotId}/messages`,
    fetcher,
    { refreshInterval: 3000, revalidateOnFocus: true }
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)

    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      body: input,
      flagged: false,
      createdAt: new Date().toISOString(),
      user: { id: currentUserId, name: 'You' },
    }
    mutate([...messages, optimistic], false)
    setInput('')

    await fetch(`/api/slots/${slotId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: input }),
    })
    setSending(false)
    mutate()
  }

  async function handleFlag(msgId: string, flagged: boolean) {
    if (msgId.startsWith('tmp-')) return
    setFlagging(msgId)
    await fetch(`/api/admin/messages/${msgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagged }),
    })
    setFlagging(null)
    mutate()
  }

  return (
    <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b bg-muted/50">
        <span className="text-sm font-medium">Game Chat</span>
      </div>
      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hi!
          </p>
        )}
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.user.id === currentUserId
            const canFlag = !isOwn && !msg.id.startsWith('tmp-')
            return (
              <div key={msg.id} className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className={`text-xs ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    {initials(msg.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isOwn && <span className="text-xs text-muted-foreground mb-0.5">{msg.user.name}</span>}
                  <div className="flex items-end gap-1">
                    <div className={`px-3 py-1.5 rounded-2xl text-sm ${
                      msg.flagged
                        ? 'bg-destructive/10 border border-destructive/30'
                        : isOwn
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-muted rounded-tl-sm'
                    }`}>
                      {msg.body}
                    </div>
                    {!isOwn && canFlag && (
                      <button
                        onClick={() => handleFlag(msg.id, !msg.flagged)}
                        disabled={flagging === msg.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive"
                        title={msg.flagged && isAdmin ? 'Unflag' : 'Flag message'}
                      >
                        <Flag className={`w-3 h-3 ${msg.flagged ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`} />
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">{timeAgo(msg.createdAt)}</span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="flex gap-2 p-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message…"
          className="flex-1 text-sm bg-transparent border-none outline-none px-2"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sending}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
