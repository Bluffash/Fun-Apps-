import { Wind, Droplets, Thermometer } from 'lucide-react'
import type { WeatherForecast } from '@/lib/weather'
import { GameTime } from './GameTime'

interface WeatherWidgetProps {
  weather: WeatherForecast
  gameTime: Date
  timezone?: string | null
}

export function WeatherWidget({ weather, gameTime, timezone }: WeatherWidgetProps) {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Weather at game time · <GameTime iso={gameTime} timezone={timezone} format="h:mm a" />
        </span>
        <span className="text-xs text-muted-foreground">Forecast</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-5xl leading-none">{weather.emoji}</span>
        <div>
          <div className="text-3xl font-bold leading-none">
            {weather.tempF}°F
            <span className="text-lg font-normal text-muted-foreground ml-1">/ {weather.tempC}°C</span>
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">{weather.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-sky-100 dark:border-sky-900">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Thermometer className="w-3.5 h-3.5 shrink-0" />
          <span>Feels {weather.feelsLikeF}°F</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Droplets className="w-3.5 h-3.5 shrink-0" />
          <span>{weather.precipChance}% rain</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Wind className="w-3.5 h-3.5 shrink-0" />
          <span>{weather.windMph} mph</span>
        </div>
      </div>
    </div>
  )
}
