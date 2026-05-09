'use client'

import { useEffect, useState } from 'react'

const ICONS = ['⚽', '🏀', '🏈', '🎾', '🏏', '🏐', '⚾', '🏒']

export function AnimatedLogo() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % ICONS.length)
        setVisible(true)
      }, 200)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-2xl transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {ICONS[index]}
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        <span className="text-white">Sports</span>
        <span className="text-primary">NextUp</span>
      </span>
    </div>
  )
}
