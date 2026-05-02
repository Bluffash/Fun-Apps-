'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Sport {
  id: string
  name: string
  icon: string
}

interface SlotFormProps {
  sports: Sport[]
  initial?: {
    id: string
    sportId: string
    title: string
    description?: string
    location: string
    startsAt: string
    endsAt: string
    capacity: number
    repeatWeekly?: boolean
  }
}

function toDatetimeLocal(iso: string) {
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm")
}

export function SlotForm({ sports, initial }: SlotFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = !!initial

  const [form, setForm] = useState({
    sportId: initial?.sportId ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    location: initial?.location ?? '',
    startsAt: initial ? toDatetimeLocal(initial.startsAt) : '',
    endsAt: initial ? toDatetimeLocal(initial.endsAt) : '',
    capacity: initial?.capacity ?? 10,
    repeatWeekly: initial?.repeatWeekly ?? false,
    repeatWeeks: 4,
  })
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const body = {
      sportId: form.sportId,
      title: form.title,
      description: form.description,
      location: form.location,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      capacity: Number(form.capacity),
      repeatWeekly: form.repeatWeekly,
      repeatWeeks: form.repeatWeekly ? Number(form.repeatWeeks) : 1,
    }

    const url = isEdit ? `/api/slots/${initial!.id}` : '/api/slots'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)

    if (res.ok) {
      const result = await res.json()
      const firstSlot = Array.isArray(result) ? result[0] : result
      const count = Array.isArray(result) ? result.length : 1
      toast({
        title: isEdit
          ? 'Game updated!'
          : count > 1
          ? `${count} recurring games created!`
          : 'Game created!',
      })
      router.push(`/schedule/${firstSlot.id}`)
    } else {
      const d = await res.json()
      toast({ title: d.error ?? 'Something went wrong', variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label>Sport</Label>
        <Select value={form.sportId} onValueChange={(v) => set('sportId', v)} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a sport" />
          </SelectTrigger>
          <SelectContent>
            {sports.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.icon} {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Saturday morning soccer"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea
          placeholder="Any notes for players…"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input
          placeholder="Central Park, Field 3"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start time</Label>
          <Input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => set('startsAt', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>End time</Label>
          <Input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => set('endsAt', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Max players ({form.capacity})</Label>
        <input
          type="range"
          min={2}
          max={30}
          value={form.capacity}
          onChange={(e) => set('capacity', e.target.value)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>2</span><span>30</span>
        </div>
      </div>

      {!isEdit && (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <Checkbox
              id="repeatWeekly"
              checked={form.repeatWeekly}
              onCheckedChange={(checked) => set('repeatWeekly', !!checked)}
            />
            <Label htmlFor="repeatWeekly" className="font-normal cursor-pointer">
              Repeat this game weekly
            </Label>
          </div>
          {form.repeatWeekly && (
            <div className="space-y-2 pl-7">
              <Label>Number of weeks ({form.repeatWeeks})</Label>
              <input
                type="range"
                min={2}
                max={12}
                value={form.repeatWeeks}
                onChange={(e) => set('repeatWeeks', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2 weeks</span><span>12 weeks</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Creates {form.repeatWeeks} game slots, one per week at the same time.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : form.repeatWeekly ? `Create ${form.repeatWeeks} Games` : 'Create Game'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
