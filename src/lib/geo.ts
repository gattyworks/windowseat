import type { Coordinate } from '../types'

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const toDegrees = (radians: number) => (radians * 180) / Math.PI

export function distanceKm(a: Coordinate, b: Coordinate): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const haversine = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine))
}

export function bearingDegrees(a: Coordinate, b: Coordinate): number {
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const deltaLng = toRadians(b.lng - a.lng)
  const y = Math.sin(deltaLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2)
    - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng)
  return (toDegrees(Math.atan2(y, x)) + 360) % 360
}

export function interpolateRoute(origin: Coordinate, destination: Coordinate, steps = 120): Coordinate[] {
  const dx = destination.lng - origin.lng
  const dy = destination.lat - origin.lat
  const length = Math.sqrt(dx * dx + dy * dy) || 1
  const normalX = -dy / length
  const normalY = dx / length
  const bend = Math.min(length * 0.065, 0.12)

  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps
    const curve = Math.sin(Math.PI * t) * bend
    const detail = Math.sin(Math.PI * t * 4) * bend * 0.08
    return {
      lat: origin.lat + dy * t + (normalY * curve) + (normalX * detail),
      lng: origin.lng + dx * t + (normalX * curve) - (normalY * detail),
    }
  })
}

export function coordinateAtProgress(route: Coordinate[], progress: number): Coordinate {
  if (route.length === 0) return { lat: 0, lng: 0 }
  const normalized = Math.max(0, Math.min(1, progress)) * (route.length - 1)
  const lower = Math.floor(normalized)
  const upper = Math.min(route.length - 1, Math.ceil(normalized))
  const mix = normalized - lower
  return {
    lat: route[lower].lat + (route[upper].lat - route[lower].lat) * mix,
    lng: route[lower].lng + (route[upper].lng - route[lower].lng) * mix,
  }
}

export function nearestProgress(route: Coordinate[], point: Coordinate): number {
  if (route.length < 2) return 0
  let nearestIndex = 0
  let nearestDistance = Number.POSITIVE_INFINITY
  route.forEach((coordinate, index) => {
    const currentDistance = distanceKm(coordinate, point)
    if (currentDistance < nearestDistance) {
      nearestDistance = currentDistance
      nearestIndex = index
    }
  })
  return nearestIndex / (route.length - 1)
}

export function cardinalDirection(bearing: number): string {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return points[Math.round(bearing / 45) % points.length]
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(0, Math.round(km * 1000))} m`
  return `${Math.round(km)} km`
}

export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}
