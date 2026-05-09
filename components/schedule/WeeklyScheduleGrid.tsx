'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GameSlotCard } from './GameSlotCard'
import { getWeekStart, getWeekDays, formatDate } from '@/lib/utils'
import { SPORTS } from '@/lib/constants'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface WeeklyScheduleGridProps {
  userId?: string
}

export function WeeklyScheduleGrid({ userId: _userId }: WeeklyScheduleGridProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart())
  const [sportFilter, setSportFilter] = useState('')

  const params = new URLSearchParams({ weekStart: weekStart.toISOString() })
  if (sportFilter) params.set('sport', sportFilter)

  const { data: slots, isLoading } = useSWR<any[]>(`/api/slots?${params}`, fetcher, {
    refreshInterval: 30000,
  })

  const weekDays = getWeekDays(weekStart)

  function prevWeek() {
    setWeekStart((d) => {
      const nd = new Date(d)
      nd.setDate(nd.getDate() - 7)
      return nd
    })
  }
  function nextWeek() {
    setWeekStart((d) => {
      const nd = new Date(d)
      nd.setDate(nd.getDate() + 7)
      return nd
    })
  }

  const slotsByDay = weekDays.map((day) => ({
    day,
    slots: (slots ?? []).filter((s) => {
      const d = new Date(s.startsAt)
      return d.toDateString() === day.toDateString()
    }),
  }))

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl border bg-card p-1.5 glow-soft">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-bold text-sm min-w-[160px] text-center px-2">
            {formatDate(weekDays[0], 'MMM d')} – {formatDate(weekDays[6], 'MMM d')}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sportFilter || 'all'} onValueChange={(v) => setSportFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🏅 All Sports</SelectItem>
              {SPORTS.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.icon} {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/schedule/new">
            <Button size="sm" className="font-bold shadow-md hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4 mr-1" />Create Game
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-12 bg-muted rounded-lg animate-pulse" />
              <div className="h-32 bg-muted rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-3">
          {slotsByDay.map(({ day, slots: daySlots }) => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div key={day.toISOString()} className="space-y-2.5">
                <div className={`relative text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isToday
                    ? 'bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-lg glow-primary'
                    : 'bg-card border border-border hover:border-primary/30'
                }`}>
                  {isToday && <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  <div className={`text-[10px] uppercase tracking-widest ${isToday ? 'opacity-90' : 'text-muted-foreground'}`}>
                    {formatDate(day, 'EEE')}
                  </div>
                  <div className="text-xl font-extrabold mt-0.5">{formatDate(day, 'd')}</div>
                  {daySlots.length > 0 && !isToday && (
                    <div className="text-[10px] font-semibold text-primary mt-0.5">
                      {daySlots.length} game{daySlots.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {daySlots.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground/60 py-6 border border-dashed border-border/60 rounded-xl">
                      No games
                    </div>
                  ) : (
                    daySlots.map((slot) => <GameSlotCard key={slot.id} slot={slot} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
