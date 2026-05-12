'use client'

import { ExternalLink } from 'lucide-react'
import useSWR from 'swr'

interface MapEmbedProps {
  location: string
}

interface GeocodeResult {
  found: boolean
  lat?: number
  lon?: number
  displayName?: string
}

const fetcher = async (url: string): Promise<GeocodeResult> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoder failed')
  return res.json()
}

export function MapEmbed({ location }: MapEmbedProps) {
  const query = encodeURIComponent(location)
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${query}`

  const { data, error, isLoading } = useSWR<GeocodeResult>(
    location ? `/api/geocode?q=${query}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const embedSrc = (() => {
    if (!data?.found || data.lat == null || data.lon == null) return null
    const { lat, lon } = data
    // ~0.01 degree bbox ≈ ~1km radius around the pin
    const d = 0.01
    const bbox = `${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}`
    const marker = `${lat}%2C${lon}`
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`
  })()

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
      {embedSrc ? (
        <iframe
          title="Game location map"
          src={embedSrc}
          className="w-full h-48 border-0"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-muted/30 text-sm text-muted-foreground">
          {isLoading
            ? 'Loading map…'
            : error || data?.found === false
              ? "Couldn't find this location on the map. Use the link above to open it in Google Maps."
              : 'Map unavailable'}
        </div>
      )}
    </div>
  )
}
