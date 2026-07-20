import { useCallback, useEffect, useRef, useState } from 'react'
import { Geolocation, type Position } from '@capacitor/geolocation'
import type { Coordinate, Place } from '../types'
import { isNative } from '../lib/native'

type LocationState = {
  coordinate: Coordinate | null
  speedKmh: number
  heading: number | null
  accuracy: number | null
  loading: boolean
  error: string | null
}

const initialState: LocationState = {
  coordinate: null,
  speedKmh: 0,
  heading: null,
  accuracy: null,
  loading: false,
  error: null,
}

function positionToState(position: Position): {
  coordinate: Coordinate
  speedKmh: number
  heading: number | null
  accuracy: number | null
} {
  return {
    coordinate: { lat: position.coords.latitude, lng: position.coords.longitude },
    speedKmh: Math.max(0, (position.coords.speed ?? 0) * 3.6),
    heading: position.coords.heading,
    accuracy: position.coords.accuracy,
  }
}

export function useLiveLocation() {
  const [state, setState] = useState<LocationState>(initialState)
  const watchId = useRef<string | number | null>(null)

  const locate = useCallback(async (): Promise<Place | null> => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      if (isNative()) await Geolocation.requestPermissions({ permissions: ['location'] })
      const position = isNative()
        ? await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 })
        : await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000 }))
      const next = positionToState(position as Position)
      setState((current) => ({ ...current, ...next, loading: false }))
      return {
        id: 'current-location',
        name: 'My location',
        detail: next.accuracy ? `Accurate to ${Math.round(next.accuracy)} m` : 'Live GPS position',
        ...next.coordinate,
        source: 'current',
      }
    } catch {
      setState((current) => ({ ...current, loading: false, error: 'Location is unavailable. You can pick a start point on the map.' }))
      return null
    }
  }, [])

  const startWatching = useCallback(async () => {
    if (watchId.current !== null) return
    try {
      if (isNative()) {
        watchId.current = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: 15000, minimumUpdateInterval: 1000 },
          (position) => {
            if (!position) return
            const next = positionToState(position)
            setState((current) => ({ ...current, ...next, error: null }))
          },
        )
      } else {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const next = positionToState(position as unknown as Position)
            setState((current) => ({ ...current, ...next, error: null }))
          },
          () => setState((current) => ({ ...current, error: 'Live GPS updates are unavailable.' })),
          { enableHighAccuracy: true, maximumAge: 1000 },
        )
      }
    } catch {
      setState((current) => ({ ...current, error: 'Live GPS updates are unavailable.' }))
    }
  }, [])

  const stopWatching = useCallback(async () => {
    if (watchId.current === null) return
    if (isNative()) await Geolocation.clearWatch({ id: String(watchId.current) })
    else navigator.geolocation.clearWatch(Number(watchId.current))
    watchId.current = null
  }, [])

  useEffect(() => () => { void stopWatching() }, [stopWatching])

  return { ...state, locate, startWatching, stopWatching }
}
