import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function tapFeedback(style: ImpactStyle = ImpactStyle.Light) {
  if (!Capacitor.isNativePlatform()) return
  try {
    await Haptics.impact({ style })
  } catch {
    // Haptics are deliberately best-effort.
  }
}

export function isNative() {
  return Capacitor.isNativePlatform()
}
