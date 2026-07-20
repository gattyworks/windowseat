import { useEffect, useMemo, useRef } from 'react'
import { GoogleMap, LatLngBounds, MapType, type Polyline } from '@capacitor/google-maps'
import type { JourneyMapProps } from './JourneyMap'
import { bearingDegrees } from '../lib/geo'

type NativeGoogleJourneyMapProps = JourneyMapProps & {
  apiKey: string
}

const nightStyles = [
  { elementType: 'geometry', stylers: [{ color: '#10201d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9db1aa' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#10201d' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#345047' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#132621' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#183027' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#294039' }] },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#60726b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#071512' }] },
]

export function NativeGoogleJourneyMap({
  apiKey,
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
}: NativeGoogleJourneyMapProps) {
  const elementRef = useRef<HTMLElement | null>(null)
  const mapRef = useRef<GoogleMap | null>(null)
  const trainMarkerRef = useRef<string | null>(null)
  const routeIdsRef = useRef<string[]>([])
  const mapId = useMemo(() => `windowseat-${Math.random().toString(36).slice(2)}`, [])
  const routeIndex = Math.max(1, Math.round(progress * (route.length - 1)))

  useEffect(() => {
    if (!elementRef.current) return
    let disposed = false
    document.documentElement.classList.add('native-google-map-active')

    const create = async () => {
      const map = await GoogleMap.create({
        id: mapId,
        element: elementRef.current!,
        apiKey,
        forceCreate: true,
        config: {
          center: { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 },
          zoom: 8,
          styles: mapStyle === 'night' ? nightStyles : null,
          androidLiteMode: false,
        },
      })
      if (disposed) {
        await map.destroy()
        return
      }
      mapRef.current = map
      if (!interactive) await map.disableTouch()
      await map.setOnMapClickListener((event) => onPick?.({ lat: event.latitude, lng: event.longitude }))
      await map.addMarkers([
        { coordinate: origin, title: origin.name, snippet: origin.detail, tintColor: { r: 152, g: 224, b: 193, a: 255 } },
        { coordinate: destination, title: destination.name, snippet: destination.detail, tintColor: { r: 217, g: 255, b: 112, a: 255 } },
      ])
      await map.fitBounds(new LatLngBounds({
        southwest: { lat: Math.min(origin.lat, destination.lat), lng: Math.min(origin.lng, destination.lng) },
        center: { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 },
        northeast: { lat: Math.max(origin.lat, destination.lat), lng: Math.max(origin.lng, destination.lng) },
      }), 84)
    }
    void create()

    return () => {
      disposed = true
      document.documentElement.classList.remove('native-google-map-active')
      const map = mapRef.current
      mapRef.current = null
      if (map) void map.destroy()
    }
  // Map creation intentionally occurs once per route.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, destination.id, mapId, origin.id])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    void map.setMapType(mapStyle === 'satellite' ? MapType.Hybrid : mapStyle === 'standard' ? MapType.Normal : MapType.Normal)
  }, [mapStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const travelled = route.slice(0, routeIndex + 1)
    const upcoming = route.slice(routeIndex)
    const update = async () => {
      if (routeIdsRef.current.length) await map.removePolylines(routeIdsRef.current)
      routeIdsRef.current = await map.addPolylines([
        { path: upcoming, strokeColor: '#f5f2e9', strokeOpacity: 0.52, strokeWeight: 5, geodesic: true } as unknown as Polyline,
        { path: travelled, strokeColor: '#d9ff70', strokeOpacity: 0.98, strokeWeight: 6, geodesic: true } as unknown as Polyline,
      ])
    }
    void update()
  }, [route, routeIndex])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !current || !showTrain) return
    const timeout = window.setTimeout(async () => {
      if (trainMarkerRef.current) await map.removeMarker(trainMarkerRef.current)
      const next = route[Math.min(route.length - 1, routeIndex + 1)] ?? destination
      trainMarkerRef.current = await map.addMarker({
        coordinate: current,
        title: 'You are here',
        snippet: 'Windowseat is following this train',
        iconUrl: 'train-marker.png',
        iconSize: { width: 48, height: 48 },
        iconAnchor: { x: 24, y: 24 },
        isFlat: true,
        zIndex: 50,
      })
      if (follow) {
        await map.setCamera({
          coordinate: current,
          zoom: 11.5,
          bearing: bearingDegrees(current, next),
          angle: 45,
          animate: true,
        })
      }
    }, 260)
    return () => window.clearTimeout(timeout)
  }, [current, destination, follow, route, routeIndex, showTrain])

  return (
    <div className={`journey-map journey-map--google journey-map--${mapStyle}`}>
      <capacitor-google-map ref={(node) => { elementRef.current = node }} className="journey-map__canvas" />
      <div className="journey-map__vignette" aria-hidden="true" />
      <div className="journey-map__grain" aria-hidden="true" />
    </div>
  )
}
