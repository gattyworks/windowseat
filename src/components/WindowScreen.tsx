import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Music2, Pause, TrainFront, Volume2 } from 'lucide-react'
import type { Coordinate, JourneySnapshot, Place } from '../types'
import { bearingDegrees, cardinalDirection, formatDistance, formatDuration } from '../lib/geo'
import { GlassIconButton } from './GlassIconButton'

type WindowScreenProps = {
  origin: Place
  destination: Place
  snapshot: JourneySnapshot
  route: Coordinate[]
  soundOn: boolean
  onToggleSound: () => void
  onClose: () => void
}

export function WindowScreen({ origin, destination, snapshot, route, soundOn, onToggleSound, onClose }: WindowScreenProps) {
  const nextIndex = Math.min(route.length - 1, Math.round(snapshot.progress * (route.length - 1)) + 1)
  const bearing = bearingDegrees(snapshot.coordinate, route[nextIndex] ?? destination)
  const progressPercent = Math.round(snapshot.progress * 100)

  return (
    <motion.main
      className="screen window-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="window-sky" aria-hidden="true">
        <div className="window-sun" />
        <div className="window-cloud window-cloud--one" />
        <div className="window-cloud window-cloud--two" />
        <div className="window-mountain window-mountain--far" />
        <div className="window-mountain window-mountain--near" />
        <div className="window-trees"><i /><i /><i /><i /><i /><i /><i /><i /></div>
        <div className="window-track"><i /><i /><i /></div>
      </div>
      <div className="window-frame" aria-hidden="true"><i /><i /></div>
      <div className="window-reflection" aria-hidden="true" />

      <header className="window-header safe-top">
        <GlassIconButton icon={<ArrowLeft />} label="Back to map" size="small" onClick={onClose} />
        <div className="window-mode-label"><span>Window view</span><small>Everything else can wait</small></div>
        <GlassIconButton icon={soundOn ? <Volume2 /> : <Music2 />} label="Toggle rail sound" size="small" active={soundOn} onClick={onToggleSound} />
      </header>

      <section className="window-place">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p><MapPin size={15} /> Outside your window</p>
          <h1>{progressPercent < 18 ? origin.name : progressPercent > 82 ? destination.name : 'Open country'}</h1>
          <span>Heading {cardinalDirection(bearing)} · {Math.round(bearing)}°</span>
        </motion.div>
      </section>

      <section className="window-hud safe-bottom">
        <div className="window-hud__route">
          <span className="window-hud__train"><TrainFront /></span>
          <span><small>{origin.code ?? 'HERE'}</small><i style={{ '--window-progress': `${progressPercent}%` } as React.CSSProperties} /><small>{destination.code ?? 'THERE'}</small></span>
        </div>
        <div className="window-hud__metrics">
          <div><small>Moving at</small><strong>{Math.round(snapshot.speedKmh)} <span>km/h</span></strong></div>
          <div><small>Arriving in</small><strong>{formatDuration(snapshot.minutesRemaining)}</strong></div>
          <div><small>Still to go</small><strong>{formatDistance(snapshot.distanceRemainingKm)}</strong></div>
        </div>
        <p className="window-hud__note"><Pause size={13} /> Put the phone down for a while. We’ll keep your place.</p>
      </section>
    </motion.main>
  )
}
