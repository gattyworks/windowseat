import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Eye, Layers3, LocateFixed, Map, MoonStar, MoreHorizontal, Music2, Pause, Play, Satellite, Square, TrainFront, Volume2, X } from 'lucide-react'
import type { Coordinate, JourneySnapshot, MapStyle, Place } from '../types'
import { formatDistance, formatDuration } from '../lib/geo'
import { GlassIconButton } from './GlassIconButton'
import { JourneyMap } from './JourneyMap'

type JourneyScreenProps = {
  origin: Place
  destination: Place
  route: Coordinate[]
  snapshot: JourneySnapshot
  mapStyle: MapStyle
  soundOn: boolean
  onToggleSound: () => void
  onMapStyle: (style: MapStyle) => void
  onTogglePause: () => void
  onWindow: () => void
  onEnd: () => void
}

const mapStyles: { id: MapStyle; label: string; icon: typeof Map }[] = [
  { id: 'night', label: 'Night', icon: MoonStar },
  { id: 'standard', label: 'Standard', icon: Map },
  { id: 'satellite', label: 'Terrain', icon: Satellite },
]

export function JourneyScreen({
  origin,
  destination,
  route,
  snapshot,
  mapStyle,
  soundOn,
  onToggleSound,
  onMapStyle,
  onTogglePause,
  onWindow,
  onEnd,
}: JourneyScreenProps) {
  const [mapSheet, setMapSheet] = useState(false)
  const [moreSheet, setMoreSheet] = useState(false)
  const [follow, setFollow] = useState(true)
  const isPaused = snapshot.status === 'paused'
  const progressPercent = Math.round(snapshot.progress * 100)

  return (
    <motion.main
      className="screen journey-screen"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.015 }}
      transition={{ duration: 0.38 }}
    >
      <JourneyMap
        origin={origin}
        destination={destination}
        route={route}
        current={snapshot.coordinate}
        progress={snapshot.progress}
        mapStyle={mapStyle}
        follow={follow}
      />

      <header className="journey-header safe-top">
        <div className="journey-route-chip">
          <span className="journey-route-chip__train"><TrainFront size={18} /></span>
          <span><b>{origin.code ?? 'HERE'}</b><i /><b>{destination.code ?? 'THERE'}</b></span>
        </div>
        <GlassIconButton icon={<MoreHorizontal />} label="More options" size="small" onClick={() => setMoreSheet(true)} />
      </header>

      <div className="journey-controls journey-controls--left">
        <GlassIconButton
          icon={isPaused ? <Play /> : <Pause />}
          label={isPaused ? 'Resume journey' : 'Pause journey'}
          active={isPaused}
          onClick={onTogglePause}
        />
        <GlassIconButton
          icon={soundOn ? <Volume2 /> : <Music2 />}
          label={soundOn ? 'Turn off rail sound' : 'Play rail sound'}
          active={soundOn}
          onClick={onToggleSound}
        />
      </div>

      <div className="journey-controls journey-controls--right">
        <button className="window-switch" type="button" onClick={onWindow}>
          <Eye size={19} />
          <span>Window</span>
        </button>
        <GlassIconButton icon={<LocateFixed />} label="Follow train" active={follow} onClick={() => setFollow((value) => !value)} />
        <GlassIconButton icon={<Layers3 />} label="Map style" onClick={() => setMapSheet(true)} />
      </div>

      <section className="journey-stats safe-bottom">
        <div className="journey-status-line">
          <span className={`status-dot ${isPaused ? 'is-paused' : ''}`} />
          <span>{isPaused ? 'Journey paused' : snapshot.isLive ? 'Live GPS' : 'Preview moving'}</span>
          <b>{progressPercent}%</b>
        </div>
        <div className="journey-progress"><i style={{ width: `${progressPercent}%` }} /></div>
        <div className="journey-metrics">
          <div><small>Time remaining</small><strong>{formatDuration(snapshot.minutesRemaining)}</strong></div>
          <div className="journey-speed"><small>Speed</small><strong>{Math.round(snapshot.speedKmh)} <span>km/h</span></strong></div>
          <div><small>Distance left</small><strong>{formatDistance(snapshot.distanceRemainingKm)}</strong></div>
        </div>
        <button className="next-stop" type="button" onClick={onWindow}>
          <span><small>Next stop</small><strong>{destination.name}</strong></span>
          <span><small>Settle in</small><Eye size={18} /></span>
        </button>
      </section>

      <AnimatePresence>
        {mapSheet && (
          <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMapSheet(false)}>
            <motion.section className="bottom-sheet safe-bottom" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} onClick={(event) => event.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="bottom-sheet__heading"><div><small>View</small><h2>Choose map style</h2></div><button type="button" onClick={() => setMapSheet(false)}><X /></button></div>
              <div className="map-style-grid">
                {mapStyles.map(({ id, label, icon: Icon }) => (
                  <button className={`map-style-card map-style-card--${id} ${id === mapStyle ? 'is-active' : ''}`} type="button" key={id} onClick={() => { onMapStyle(id); setMapSheet(false) }}>
                    <Icon />
                    <strong>{label}</strong>
                    <span>{id === mapStyle ? 'Selected' : 'Tap to use'}</span>
                  </button>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {moreSheet && (
          <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMoreSheet(false)}>
            <motion.section className="bottom-sheet bottom-sheet--compact safe-bottom" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} onClick={(event) => event.stopPropagation()}>
              <div className="sheet-handle" />
              <div className="journey-summary-row"><span><small>From</small><strong>{origin.name}</strong></span><ChevronDown size={18} /><span><small>To</small><strong>{destination.name}</strong></span></div>
              <button className="quiet-mode-row" type="button" onClick={onWindow}><Eye /><span><strong>Look out the window</strong><small>Hide the map and quiet the interface</small></span></button>
              <button className="end-journey-button" type="button" onClick={onEnd}><Square size={17} /> End journey</button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  )
}
