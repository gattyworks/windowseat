import { motion } from 'framer-motion'
import { ArrowRight, LocateFixed, MapPin, Sparkles } from 'lucide-react'
import { ROUTE_PRESETS } from '../data/stations'
import { interpolateRoute } from '../lib/geo'
import type { Place, RoutePreset } from '../types'
import { JourneyMap } from './JourneyMap'
import { TrainMark } from './TrainMark'

type HomeScreenProps = {
  origin: Place
  onPlan: () => void
  onLocate: () => void
  onPreset: (preset: RoutePreset) => void
  locating: boolean
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomeScreen({ origin, onPlan, onLocate, onPreset, locating }: HomeScreenProps) {
  const preview = ROUTE_PRESETS[0]
  const route = interpolateRoute(preview.origin, preview.destination)

  return (
    <motion.main
      className="screen home-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.45 }}
    >
      <JourneyMap
        origin={preview.origin}
        destination={preview.destination}
        route={route}
        current={origin}
        progress={0.06}
        mapStyle="night"
        interactive={false}
        showTrain={false}
      />

      <header className="home-header safe-top">
        <div className="brand-lockup">
          <span className="brand-mark"><TrainMark /></span>
          <span>Windowseat</span>
        </div>
        <button className="location-pill" type="button" onClick={onLocate} disabled={locating}>
          <LocateFixed size={16} />
          <span>{locating ? 'Finding you…' : origin.name}</span>
        </button>
      </header>

      <section className="home-hero">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow"><Sparkles size={14} /> {greeting()}</p>
          <h1>Your quiet carriage<br />for the journey.</h1>
          <p className="home-subtitle">Follow your train. See what’s outside. Let everything else wait.</p>
        </motion.div>
      </section>

      <section className="home-dock safe-bottom">
        <motion.button
          type="button"
          className="destination-cta"
          onClick={onPlan}
          whileTap={{ scale: 0.985 }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.58 }}
        >
          <span className="destination-cta__icon"><MapPin size={22} /></span>
          <span className="destination-cta__copy">
            <small>Start a journey</small>
            <strong>Where are you going?</strong>
          </span>
          <span className="destination-cta__arrow"><ArrowRight size={21} /></span>
        </motion.button>

        <div className="route-rail" role="list" aria-label="Suggested journeys">
          {ROUTE_PRESETS.slice(0, 3).map((preset, index) => (
            <motion.button
              type="button"
              role="listitem"
              className="route-card"
              key={preset.id}
              onClick={() => onPreset(preset)}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.07 }}
            >
              <span className="route-card__codes">
                <b>{preset.origin.code}</b>
                <span className="route-card__line"><i /></span>
                <b>{preset.destination.code}</b>
              </span>
              <strong>{preset.origin.name} to {preset.destination.name}</strong>
              <small>{preset.label}</small>
            </motion.button>
          ))}
        </div>
      </section>
    </motion.main>
  )
}
