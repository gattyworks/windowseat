import { useEffect, useMemo, useState } from 'react'
import { STATIONS } from '../data/stations'
import type { Place } from '../types'

type NominatimResult = {
  place_id: number
  display_name: string
  lat: string
  lon: string
  name?: string
  type?: string
}

export function usePlaceSearch(query: string) {
  const [remote, setRemote] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)

  const local = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return STATIONS.slice(0, 6)
    return STATIONS.filter((station) => (
      station.name.toLowerCase().includes(normalized)
      || station.detail.toLowerCase().includes(normalized)
      || station.code?.toLowerCase().includes(normalized)
    )).slice(0, 5)
  }, [query])

  useEffect(() => {
    const normalized = query.trim()
    if (normalized.length < 3) {
      setRemote([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ format: 'jsonv2', q: normalized, limit: '5', addressdetails: '0' })
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: { 'Accept-Language': 'en-IN,en;q=0.8' },
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Search unavailable')
        const results = await response.json() as NominatimResult[]
        setRemote(results.map((result) => {
          const [name, ...detail] = result.display_name.split(',')
          return {
            id: `search-${result.place_id}`,
            name: result.name || name,
            detail: detail.join(',').trim() || result.type || 'Map result',
            lat: Number(result.lat),
            lng: Number(result.lon),
            source: 'search' as const,
          }
        }))
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setRemote([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 420)
    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  const results = [...local, ...remote.filter((place) => !local.some((station) => station.name === place.name))].slice(0, 7)
  return { results, loading }
}
