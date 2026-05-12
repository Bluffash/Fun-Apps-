'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface GameTimeProps {
  iso: string | Date
  /** IANA timezone for the game's location. Falls back to viewer's local zone if missing. */
  timezone?: string | null
  /** date-fns format string */
  format?: string
}

/**
 * Renders a game date/time in the game's local timezone when available,
 * otherwise falls back to the viewer's browser timezone.
 *
 * Renders blank on the server pass to avoid TZ-related hydration mismatches —
 * the value fills in on the client after mount.
 */
export function GameTime({ iso, timezone, format: fmt = 'PPp' }: GameTimeProps) {
  const [text, setText] = useState<string>('')

  useEffect(() => {
    const date = typeof iso === 'string' ? new Date(iso) : iso
    const zone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    try {
      setText(formatInTimeZone(date, zone, fmt))
    } catch {
      setText(format(date, fmt))
    }
  }, [iso, timezone, fmt])

  // Reserve space with a non-breaking space until hydrated so layout doesn't jump.
  return <>{text || ' '}</>
}
