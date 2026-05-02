'use client'

import { cn } from '@/lib/utils'
import { SPORTS } from '@/lib/constants'

interface SportPickerProps {
  selected: string[]
  onChange: (ids: string[]) => void
  sportMap: Record<string, string>
}

export function SportPicker({ selected, onChange, sportMap }: SportPickerProps) {
  function toggle(slug: string) {
    const id = sportMap[slug]
    if (!id) return
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {SPORTS.map((sport) => {
        const id = sportMap[sport.slug]
        const isSelected = id && selected.includes(id)
        return (
          <button
            key={sport.slug}
            type="button"
            onClick={() => toggle(sport.slug)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105',
              isSelected
                ? 'border-primary bg-primary/10 text-primary font-semibold'
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground'
            )}
          >
            <span className="text-3xl">{sport.icon}</span>
            <span className="text-sm text-center leading-tight">{sport.name}</span>
          </button>
        )
      })}
    </div>
  )
}
