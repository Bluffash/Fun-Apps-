'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-semibold text-sm min-w-[160px] text-center">
            {formatDate(weekDays[0], 'MMM d')} – {formatDate(weekDays[6], 'MMM d, yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setSportFilter('')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sportFilter === '' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            {SPORTS.map((s) => (
              <button
                key={s.slug}
                onClick={() => setSportFilter(s.slug === sportFilter ? '' : s.slug)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sportFilter === s.slug ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>
          <Link href="/schedule/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Create Game</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {weekDays.map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-24 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-2">
          {slotsByDay.map(({ day, slots: daySlots }) => (
            <div key={day.toISOString()} className="space-y-2">
              <div className={`text-center py-1 rounded-md text-xs font-semibold ${
                day.toDateString() === new Date().toDateString()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <div>{formatDate(day, 'EEE')}</div>
                <div className="text-base font-bold">{formatDate(day, 'd')}</div>
              </div>
              <div className="space-y-2">
                {daySlots.length === 0 ? (
                  <div className="text-center text-xs text-muted-foreground py-4 border border-dashed rounded-md">
                    No games
                  </div>
                ) : (
                  daySlots.map((slot) => <GameSlotCard key={slot.id} slot={slot} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
