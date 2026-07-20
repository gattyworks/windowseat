import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Crosshair, LoaderCircle, MapPin, Navigation, Search, TrainFront } from 'lucide-react'
import { usePlaceSearch } from '../hooks/usePlaceSearch'
import { distanceKm, formatDistance, formatDuration, interpolateRoute } from '../lib/geo'
import type { Coordinate, Place } from '../types'
import { JourneyMap } from './JourneyMap'

type PlannerScreenProps = {
  initialOrigin: Place
  initialDestination: Place
  onClose: () => void
  onLocate: () => Promise<Place | null>
  onStart: (origin: Place, destination: Place) => void
}

type ActiveField = 'origin' | 'destination'

export function PlannerScreen({ initialOrigin, initialDestination, onClose, onLocate, onStart }: PlannerScreenProps) {
  const [origin, setOrigin] = useState(initialOrigin)
  const [destination, setDestination] = useState(initialDestination)
  const [activeField, setActiveField] = useState<ActiveField>('destination')
  const [query, setQuery] = useState('')
  const [locating, setLocating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { results, loading } = usePlaceSearch(query)
  const route = useMemo(() => interpolateRoute(origin, destination), [destination, origin])
  const distance = distanceKm(origin, destination)
  const duration = (distance / 62) * 60 + 18

  const choosePlace = (place: Place) => {
    if (activeField === 'origin') {
      setOrigin(place)
      setActiveField('destination')
    } else {
      setDestination(place)
    }
    setQuery('')
  }

  const chooseMapPoint = (coordinate: Coordinate) => {
    const place: Place = {
      id: `map-${coordinate.lat.toFixed(5)}-${coordinate.lng.toFixed(5)}`,
      name: activeField === 'origin' ? 'Picked start' : 'Dropped pin',
      detail: `${coordinate.lat.toFixed(4)}, ${coordinate.lng.toFixed(4)}`,
      ...coordinate,
      source: 'map',
    }
    choosePlace(place)
  }

  const useMyLocation = async () => {
    setLocating(true)
    const place = await onLocate()
    if (place) setOrigin(place)
    setLocating(false)
    setActiveField('destination')
  }

  return (
    <motion.main
      className="screen planner-screen"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 31 }}
    >
      <JourneyMap
        origin={origin}
        destination={destination}
        route={route}
        mapStyle="night"
        interactive
        showTrain={false}
        onPick={chooseMapPoint}
      />

      <div className="planner-top safe-top">
        <button className="back-button" type="button" onClick={onClose} aria-label="Back"><ArrowLeft /></button>
        <div className="planner-heading">
          <span>Plan a quiet ride</span>
          <small>Tap the map or search a station</small>
        </div>
      </div>

      <motion.section className="planner-sheet safe-bottom" layout>
        <div className="sheet-handle" />
        <div className="route-fields">
          <button
            type="button"
            className={`route-field ${activeField === 'origin' ? 'is-active' : ''}`}
            onClick={() => { setActiveField('origin'); setQuery(''); window.setTimeout(() => inputRef.current?.focus(), 60) }}
          >
            <span className="route-field__dot route-field__dot--origin" />
            <span><small>From</small><strong>{origin.name}</strong></span>
          </button>
          <span className="route-fields__rail"><i /><i /><i /></span>
          <button
            type="button"
            className={`route-field ${activeField === 'destination' ? 'is-active' : ''}`}
            onClick={() => { setActiveField('destination'); setQuery(''); window.setTimeout(() => inputRef.current?.focus(), 60) }}
          >
            <span className="route-field__dot route-field__dot--destination"><TrainFront size={12} /></span>
            <span><small>To</small><strong>{destination.name}</strong></span>
          </button>
        </div>

        <div className="search-box">
          <Search size={19} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${activeField === 'origin' ? 'starting point' : 'destination'}`}
            aria-label="Search places"
          />
          {loading && <LoaderCircle className="spin" size={18} />}
        </div>

        <AnimatePresence initial={false}>
          {(query || activeField === 'origin') && (
            <motion.div
              className="search-results"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {activeField === 'origin' && (
                <button className="place-result place-result--location" type="button" onClick={useMyLocation} disabled={locating}>
                  <span><Crosshair size={19} /></span>
                  <div><strong>{locating ? 'Finding your location…' : 'Use my current location'}</strong><small>Best while you’re already on the train</small></div>
                </button>
              )}
              {results.map((place) => (
                <button className="place-result" type="button" onClick={() => choosePlace(place)} key={place.id}>
                  <span>{place.source === 'station' ? <TrainFront size={18} /> : <MapPin size={18} />}</span>
                  <div><strong>{place.name}</strong><small>{place.detail}</small></div>
                  {place.code && <b>{place.code}</b>}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!query && activeField === 'destination' && (
          <div className="journey-ticket">
            <div className="journey-ticket__top">
              <span><small>Leaving</small><strong>{origin.code ?? 'HERE'}</strong></span>
              <span className="ticket-track"><i /><Navigation size={14} /><i /></span>
              <span><small>Going to</small><strong>{destination.code ?? 'THERE'}</strong></span>
            </div>
            <div className="journey-ticket__stats">
              <span><small>Distance</small><b>{formatDistance(distance)}</b></span>
              <span><small>Est. journey</small><b>{formatDuration(duration)}</b></span>
            </div>
          </div>
        )}

        <motion.button
          type="button"
          className="primary-button"
          whileTap={{ scale: 0.985 }}
          onClick={() => onStart(origin, destination)}
          disabled={distance < 0.5}
        >
          <span>Start journey</span>
          <ArrowRight size={20} />
        </motion.button>
      </motion.section>
    </motion.main>
  )
}
