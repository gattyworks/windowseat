export type Coordinate = {
  lat: number
  lng: number
}

export type Place = Coordinate & {
  id: string
  name: string
  detail: string
  code?: string
  source?: 'station' | 'search' | 'current' | 'map'
}

export type RoutePreset = {
  id: string
  origin: Place
  destination: Place
  label: string
  durationMinutes: number
}

export type MapStyle = 'satellite' | 'standard' | 'night'

export type JourneyStatus = 'moving' | 'paused' | 'arrived'

export type JourneySnapshot = {
  coordinate: Coordinate
  progress: number
  speedKmh: number
  distanceRemainingKm: number
  minutesRemaining: number
  status: JourneyStatus
  isLive: boolean
}
