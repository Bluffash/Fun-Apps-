'use client'

import { ExternalLink } from 'lucide-react'

interface MapEmbedProps {
  location: string
}

export function MapEmbed({ location }: MapEmbedProps) {
  const query = encodeURIComponent(location)
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${query}`

  return (
    <div className="rounded-lg overflow-hidden border">
      <div className="bg-muted px-3 py-2 flex items-center justify-between">
        <span className="text-sm font-medium truncate">{location}</span>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 ml-2"
        >
          Open in Maps <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <iframe
        title="Game location map"
        src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&query=${query}`}
        className="w-full h-48 border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}
