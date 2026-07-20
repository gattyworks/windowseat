import { useEffect, useMemo, useRef, useState } from 'react'
import type { Coordinate, JourneySnapshot, JourneyStatus, Place } from '../types'
import { coordinateAtProgress, distanceKm, interpolateRoute, nearestProgress } from '../lib/geo'

type JourneyOptions = {
  origin: Place
  destination: Place
  liveCoordinate: Coordinate | null
  liveSpeedKmh: number
  useLiveGps: boolean
}

export function useJourney({ origin, destination, liveCoordinate, liveSpeedKmh, useLiveGps }: JourneyOptions) {
  const route = useMemo(() => interpolateRoute(origin, destination), [origin, destination])
  const totalDistanceKm = useMemo(() => {
    return route.slice(1).reduce((sum, point, index) => sum + distanceKm(route[index], point), 0)
  }, [route])
  const [progress, setProgress] = useState(0.025)
  const [status, setStatus] = useState<JourneyStatus>('moving')
  const [demoSpeed, setDemoSpeed] = useState(82)
  const lastTick = useRef(performance.now())

  useEffect(() => {
    setProgress(0.025)
    setStatus('moving')
  }, [origin.id, destination.id])

  useEffect(() => {
    if (!useLiveGps || !liveCoordinate) return
    setProgress((current) => Math.max(current, nearestProgress(route, liveCoordinate)))
  }, [liveCoordinate, route, useLiveGps])

  useEffect(() => {
    if (status !== 'moving' || (useLiveGps && liveCoordinate)) return
    let frame = 0
    const tick = (now: number) => {
      const seconds = Math.min(0.1, (now - lastTick.current) / 1000)
      lastTick.current = now
      setProgress((current) => {
        const next = Math.min(1, current + seconds / 105)
        if (next >= 1) setStatus('arrived')
        return next
      })
      setDemoSpeed(80 + Math.sin(now / 1700) * 7 + Math.sin(now / 430) * 2)
      frame = requestAnimationFrame(tick)
    }
    lastTick.current = performance.now()
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [liveCoordinate, status, useLiveGps])

  const coordinate = useLiveGps && liveCoordinate
    ? liveCoordinate
    : coordinateAtProgress(route, progress)
  const speedKmh = useLiveGps && liveCoordinate ? liveSpeedKmh : demoSpeed
  const distanceRemainingKm = Math.max(0, totalDistanceKm * (1 - progress))
  const effectiveSpeed = Math.max(speedKmh, 35)
  const minutesRemaining = (distanceRemainingKm / effectiveSpeed) * 60

  const snapshot: JourneySnapshot = {
    coordinate,
    progress,
    speedKmh,
    distanceRemainingKm,
    minutesRemaining,
    status,
    isLive: Boolean(useLiveGps && liveCoordinate),
  }

  const togglePause = () => setStatus((current) => current === 'moving' ? 'paused' : 'moving')

  return { route, totalDistanceKm, snapshot, setProgress, togglePause }
}
