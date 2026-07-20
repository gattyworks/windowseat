import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import type { Coordinate, MapStyle, Place } from '../types'
import { useJourney } from '../hooks/useJourney'
import { startRailSound, stopRailSound } from '../lib/audio'
import { JourneyScreen } from './JourneyScreen'
import { WindowScreen } from './WindowScreen'

type ActiveJourneyProps = {
  origin: Place
  destination: Place
  liveCoordinate: Coordinate | null
  liveSpeedKmh: number
  startWatching: () => Promise<void>
  stopWatching: () => Promise<void>
  onEnd: () => void
}

export function ActiveJourney({
  origin,
  destination,
  liveCoordinate,
  liveSpeedKmh,
  startWatching,
  stopWatching,
  onEnd,
}: ActiveJourneyProps) {
  const useLiveGps = origin.source === 'current'
  const { route, snapshot, togglePause } = useJourney({ origin, destination, liveCoordinate, liveSpeedKmh, useLiveGps })
  const [mapStyle, setMapStyle] = useState<MapStyle>('night')
  const [windowMode, setWindowMode] = useState(false)
  const [soundOn, setSoundOn] = useState(false)

  useEffect(() => {
    if (useLiveGps) void startWatching()
    return () => {
      void stopWatching()
      stopRailSound()
    }
  }, [startWatching, stopWatching, useLiveGps])

  const toggleSound = async () => {
    if (soundOn) stopRailSound()
    else await startRailSound()
    setSoundOn((current) => !current)
  }

  return (
    <AnimatePresence mode="wait">
      {windowMode ? (
        <WindowScreen
          key="window"
          origin={origin}
          destination={destination}
          snapshot={snapshot}
          route={route}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onClose={() => setWindowMode(false)}
        />
      ) : (
        <JourneyScreen
          key="map"
          origin={origin}
          destination={destination}
          route={route}
          snapshot={snapshot}
          mapStyle={mapStyle}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onMapStyle={setMapStyle}
          onTogglePause={togglePause}
          onWindow={() => setWindowMode(true)}
          onEnd={onEnd}
        />
      )}
    </AnimatePresence>
  )
}
