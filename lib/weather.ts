const WMO_CODES: Record<number, { description: string; emoji: string }> = {
  0:  { description: 'Clear sky',         emoji: '☀️' },
  1:  { description: 'Mainly clear',      emoji: '🌤️' },
  2:  { description: 'Partly cloudy',     emoji: '⛅' },
  3:  { description: 'Overcast',          emoji: '☁️' },
  45: { description: 'Foggy',             emoji: '🌫️' },
  48: { description: 'Foggy',             emoji: '🌫️' },
  51: { description: 'Light drizzle',     emoji: '🌦️' },
  53: { description: 'Drizzle',           emoji: '🌦️' },
  55: { description: 'Heavy drizzle',     emoji: '🌧️' },
  61: { description: 'Light rain',        emoji: '🌧️' },
  63: { description: 'Rain',              emoji: '🌧️' },
  65: { description: 'Heavy rain',        emoji: '🌧️' },
  71: { description: 'Light snow',        emoji: '🌨️' },
  73: { description: 'Snow',              emoji: '🌨️' },
  75: { description: 'Heavy snow',        emoji: '❄️' },
  80: { description: 'Rain showers',      emoji: '🌦️' },
  81: { description: 'Rain showers',      emoji: '🌧️' },
  82: { description: 'Heavy showers',     emoji: '🌧️' },
  95: { description: 'Thunderstorm',      emoji: '⛈️' },
  96: { description: 'Thunderstorm',      emoji: '⛈️' },
  99: { description: 'Thunderstorm',      emoji: '⛈️' },
}

export interface WeatherForecast {
  emoji: string
  description: string
  tempC: number
  tempF: number
  feelsLikeC: number
  feelsLikeF: number
  precipChance: number
  windKph: number
  windMph: number
}

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      {
        headers: { 'User-Agent': 'SportsNextUp-App/1.0' },
        next: { revalidate: 86400 },
      }
    )
    const data = await res.json()
    if (!data[0]) return null
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

export async function getGameWeather(location: string, gameTime: Date): Promise<WeatherForecast | null> {
  const now = new Date()
  const diffMs = gameTime.getTime() - now.getTime()
  // Only show forecast for games within the next 16 days
  if (diffMs < 0 || diffMs > 16 * 24 * 60 * 60 * 1000) return null

  const coords = await geocode(location)
  if (!coords) return null

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,windspeed_10m` +
      `&temperature_unit=celsius&windspeed_unit=kmh&timezone=auto&forecast_days=16`,
      { next: { revalidate: 1800 } } // cache 30 min
    )
    const data = await res.json()

    const targetHour = gameTime.toISOString().slice(0, 13)
    const times: string[] = data.hourly.time
    let idx = times.findIndex((t) => t.startsWith(targetHour))
    if (idx === -1) idx = times.findIndex((t) => t >= gameTime.toISOString().slice(0, 16))
    if (idx === -1) return null

    const code: number = data.hourly.weathercode[idx] ?? 0
    const wmo = WMO_CODES[code] ?? { description: 'Unknown', emoji: '🌡️' }
    const tempC = Math.round(data.hourly.temperature_2m[idx])
    const feelsLikeC = Math.round(data.hourly.apparent_temperature[idx])
    const windKph = Math.round(data.hourly.windspeed_10m[idx])

    return {
      emoji: wmo.emoji,
      description: wmo.description,
      tempC,
      tempF: Math.round(tempC * 9 / 5 + 32),
      feelsLikeC,
      feelsLikeF: Math.round(feelsLikeC * 9 / 5 + 32),
      precipChance: data.hourly.precipitation_probability[idx] ?? 0,
      windKph,
      windMph: Math.round(windKph * 0.621),
    }
  } catch {
    return null
  }
}
