import { describe, expect, it } from 'vitest'
import { bearingDegrees, cardinalDirection, coordinateAtProgress, distanceKm, formatDuration, interpolateRoute, nearestProgress } from './geo'

const bengaluru = { lat: 12.9788, lng: 77.5696 }
const mysuru = { lat: 12.3167, lng: 76.6453 }

describe('journey geography', () => {
  it('calculates a credible rail corridor distance', () => {
    expect(distanceKm(bengaluru, mysuru)).toBeGreaterThan(120)
    expect(distanceKm(bengaluru, mysuru)).toBeLessThan(150)
  })

  it('builds a curved route anchored to both stations', () => {
    const route = interpolateRoute(bengaluru, mysuru, 40)
    expect(route).toHaveLength(41)
    expect(route[0]).toEqual(bengaluru)
    expect(route.at(-1)).toEqual(mysuru)
    expect(coordinateAtProgress(route, 0.5)).not.toEqual(bengaluru)
  })

  it('projects live coordinates back to journey progress', () => {
    const route = interpolateRoute(bengaluru, mysuru, 100)
    const midway = coordinateAtProgress(route, 0.5)
    expect(nearestProgress(route, midway)).toBeCloseTo(0.5, 1)
  })

  it('formats direction and duration for the HUD', () => {
    expect(cardinalDirection(bearingDegrees(bengaluru, mysuru))).toMatch(/W/)
    expect(formatDuration(135)).toBe('2h 15m')
  })
})
