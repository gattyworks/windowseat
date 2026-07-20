import { useEffect, useMemo, useRef } from 'react'
import L, { type Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinate, MapStyle, Place } from '../types'
import { bearingDegrees } from '../lib/geo'
import { isNative } from '../lib/native'
import { NativeGoogleJourneyMap } from './NativeGoogleJourneyMap'

export type JourneyMapProps = {
  origin: Place
  destination: Place
  route: Coordinate[]
  current?: Coordinate
  progress?: number
  mapStyle: MapStyle
  interactive?: boolean
  follow?: boolean
  showTrain?: boolean
  onPick?: (coordinate: Coordinate) => void
}

const tileLayers: Record<MapStyle, { url: string; attribution: string }> = {
  satellite: {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors, Tiles style by HOT',
  },
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  night: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
}

function trainIcon(rotation: number) {
  return L.divIcon({
    className: 'train-map-marker-shell',
    html: `<div class="train-map-marker" style="--train-rotation:${rotation}deg">
      <div class="train-map-marker__halo"></div>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M18 8h28c5 0 9 4 9 9v25c0 7-5 12-12 13l5 5h-7l-4-5H27l-4 5h-7l5-5c-7-1-12-6-12-13V17c0-5 4-9 9-9Z" fill="#d9ff70"/>
        <path d="M17 18c0-2 2-4 4-4h22c2 0 4 2 4 4v11H17V18Z" fill="#10241f"/>
        <path d="M21 34h22" stroke="#10241f" stroke-width="4" stroke-linecap="round"/>
        <circle cx="22" cy="42" r="3" fill="#10241f"/><circle cx="42" cy="42" r="3" fill="#10241f"/>
      </svg>
    </div>`,
    iconSize: [62, 62],
    iconAnchor: [31, 31],
  })
}

function stationIcon(label: string, active = false) {
  return L.divIcon({
    className: 'station-map-marker-shell',
    html: `<div class="station-map-marker ${active ? 'is-destination' : ''}"><span>${label}</span></div>`,
    iconAnchor: [20, 20],
  })
}

function LeafletJourneyMap({
  origin,
  destination,
  route,
  current,
  progress = 0,
  mapStyle,
  interactive = true,
  follow = false,
  showTrain = true,
  onPick,
}: JourneyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const currentRef = useRef<L.Marker | null>(null)
  const travelledRef = useRef<L.Polyline | null>(null)
  const upcomingRef = useRef<L.Polyline | null>(null)
  const tileRef = useRef<L.TileLayer | null>(null)
  const clickHandlerRef = useRef(onPick)
  clickHandlerRef.current = onPick

  const routeIndex = Math.max(1, Math.round(progress * (route.length - 1)))
  const travelled = useMemo(() => route.slice(0, routeIndex + 1), [route, routeIndex])
  const upcoming = useMemo(() => route.slice(routeIndex), [route, routeIndex])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const bounds = L.latLngBounds([origin.lat, origin.lng], [destination.lat, destination.lng]).pad(0.35)
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
      // SVG paths survive animated map/window transitions more reliably than
      // Leaflet's shared canvas renderer on Android WebViews.
      preferCanvas: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    })
    map.fitBounds(bounds, { padding: [36, 72], maxZoom: 11 })
    map.createPane('routePane')
    map.getPane('routePane')!.style.zIndex = '450'
    map.createPane('markerPaneTop')
    map.getPane('markerPaneTop')!.style.zIndex = '680'
    mapRef.current = map
    map.on('click', (event) => clickHandlerRef.current?.({ lat: event.latlng.lat, lng: event.latlng.lng }))
    window.setTimeout(() => map.invalidateSize(), 60)
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [destination.lat, destination.lng, interactive, origin.lat, origin.lng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    tileRef.current?.remove()
    const tile = tileLayers[mapStyle]
    tileRef.current = L.tileLayer(tile.url, { attribution: tile.attribution, maxZoom: 19, crossOrigin: true }).addTo(map)
  }, [mapStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const originMarker = L.marker([origin.lat, origin.lng], { icon: stationIcon(origin.code ?? 'FROM'), pane: 'markerPaneTop' }).addTo(map)
    const destinationMarker = L.marker([destination.lat, destination.lng], { icon: stationIcon(destination.code ?? 'TO', true), pane: 'markerPaneTop' }).addTo(map)
    return () => {
      originMarker.remove()
      destinationMarker.remove()
    }
  }, [destination.code, destination.lat, destination.lng, origin.code, origin.lat, origin.lng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    upcomingRef.current?.remove()
    travelledRef.current?.remove()
    upcomingRef.current = L.polyline(upcoming.map((item) => [item.lat, item.lng]), {
      color: '#f5f2e9', weight: 5, opacity: 0.48, dashArray: '2 12', lineCap: 'round', pane: 'routePane',
    }).addTo(map)
    travelledRef.current = L.polyline(travelled.map((item) => [item.lat, item.lng]), {
      color: '#d9ff70', weight: 6, opacity: 0.95, lineCap: 'round', pane: 'routePane',
    }).addTo(map)
  }, [travelled, upcoming])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !current || !showTrain) {
      currentRef.current?.remove()
      currentRef.current = null
      return
    }
    const nextIndex = Math.min(route.length - 1, routeIndex + 1)
    const rotation = bearingDegrees(current, route[nextIndex] ?? destination)
    if (!currentRef.current) {
      currentRef.current = L.marker([current.lat, current.lng], { icon: trainIcon(rotation), pane: 'markerPaneTop' }).addTo(map)
    } else {
      currentRef.current.setLatLng([current.lat, current.lng])
      currentRef.current.setIcon(trainIcon(rotation))
    }
    if (follow) map.panTo([current.lat, current.lng], { animate: true, duration: 0.8 })
  }, [current, destination, follow, route, routeIndex, showTrain])

  return (
    <div className={`journey-map journey-map--${mapStyle}`}>
      <div ref={containerRef} className="journey-map__canvas" />
      <div className="journey-map__vignette" aria-hidden="true" />
      <div className="journey-map__grain" aria-hidden="true" />
    </div>
  )
}

export function JourneyMap(props: JourneyMapProps) {
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  if (isNative() && googleMapsKey) {
    return <NativeGoogleJourneyMap {...props} apiKey={googleMapsKey} />
  }
  return <LeafletJourneyMap {...props} />
}
