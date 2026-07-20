import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Preferences } from '@capacitor/preferences'
import { DEFAULT_DESTINATION, DEFAULT_ORIGIN } from './data/stations'
import { useLiveLocation } from './hooks/useLiveLocation'
import { tapFeedback } from './lib/native'
import type { Place, RoutePreset } from './types'
import { ActiveJourney } from './components/ActiveJourney'
import { HomeScreen } from './components/HomeScreen'
import { PlannerScreen } from './components/PlannerScreen'
import './App.css'

type Screen = 'home' | 'planner' | 'journey'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [origin, setOrigin] = useState<Place>(DEFAULT_ORIGIN)
  const [destination, setDestination] = useState<Place>(DEFAULT_DESTINATION)
  const [toast, setToast] = useState<string | null>(null)
  const live = useLiveLocation()

  useEffect(() => {
    const prepare = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: true })
        await StatusBar.setStyle({ style: Style.Light })
      } catch {
        // Browser previews do not expose native chrome.
      }
      const saved = await Preferences.get({ key: 'windowseat:last-route' })
      if (saved.value) {
        try {
          const route = JSON.parse(saved.value) as { origin: Place; destination: Place }
          setOrigin(route.origin)
          setDestination(route.destination)
        } catch {
          await Preferences.remove({ key: 'windowseat:last-route' })
        }
      }
      await SplashScreen.hide({ fadeOutDuration: 450 })
    }
    void prepare()
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const locate = async () => {
    void tapFeedback()
    const place = await live.locate()
    if (place) setOrigin(place)
    else if (live.error) setToast(live.error)
    return place
  }

  const startJourney = async (nextOrigin: Place, nextDestination: Place) => {
    setOrigin(nextOrigin)
    setDestination(nextDestination)
    await Preferences.set({ key: 'windowseat:last-route', value: JSON.stringify({ origin: nextOrigin, destination: nextDestination }) })
    void tapFeedback()
    setScreen('journey')
  }

  const startPreset = (preset: RoutePreset) => {
    void startJourney(preset.origin, preset.destination)
  }

  return (
    <div className="app-shell">
      <AnimatePresence mode="popLayout" initial={false}>
        {screen === 'home' && (
          <HomeScreen
            key="home"
            origin={origin}
            locating={live.loading}
            onLocate={() => { void locate() }}
            onPlan={() => { void tapFeedback(); setScreen('planner') }}
            onPreset={startPreset}
          />
        )}
        {screen === 'planner' && (
          <PlannerScreen
            key="planner"
            initialOrigin={origin}
            initialDestination={destination}
            onClose={() => setScreen('home')}
            onLocate={locate}
            onStart={(nextOrigin, nextDestination) => { void startJourney(nextOrigin, nextDestination) }}
          />
        )}
        {screen === 'journey' && (
          <ActiveJourney
            key="journey"
            origin={origin}
            destination={destination}
            liveCoordinate={live.coordinate}
            liveSpeedKmh={live.speedKmh}
            startWatching={live.startWatching}
            stopWatching={live.stopWatching}
            onEnd={() => setScreen('home')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div className="app-toast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
