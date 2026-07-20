# Windowseat

Windowseat is a quiet, no-account train companion from GattyWorks. Pick where you are and where you are going, watch your train move along the route, or switch to Window View and let the interface fade into the background.

## What is in the first APK

- Live GPS tracking when **My location** is selected as the starting point
- Smooth animated preview when GPS is unavailable, making the app useful on emulators and at home
- Station search, worldwide place search, and tap-to-pick map coordinates
- Animated train marker, travelled/upcoming route, ETA, remaining distance, and speed
- Pause, follow, map-style, and low-distraction Window View controls
- Optional synthesized rail ambience—no bundled audio files or network stream
- No login, profile, onboarding, analytics, or backend
- Last route saved locally on the device

## Map providers

Windowseat is wired for the native Google Maps SDK through `@capacitor/google-maps`. Google requires a billing-enabled, restricted API key for every Android app. If no key is supplied, Windowseat automatically uses its included OpenStreetMap/Leaflet map so the APK remains fully usable.

To build with Google Maps:

1. Enable **Maps SDK for Android** in Google Cloud.
2. Create an Android-restricted API key for package `works.gatty.windowseat` and the signing certificate SHA-1.
3. Set the key only for the build session:

   ```powershell
   $env:GOOGLE_MAPS_API_KEY='your-restricted-key'
   npm run android:apk
   ```

The key is injected into both the web bundle and Android resources at build time. It is never committed.

## Develop

Requirements: Node.js 22+, JDK 21, and Android SDK Platform 36.

```powershell
npm install
npm run dev
```

Useful checks:

```powershell
npm test
npm run lint
npm run build
```

## Build the APK

```powershell
npm run android:apk
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. It is signed with the local Android debug certificate and can be sideloaded directly.

## Privacy

Location stays on the device and is used only to position the train marker. Place search goes directly to OpenStreetMap Nominatim, and map tiles are fetched from the selected provider. Windowseat contains no advertising or analytics SDK.

## License

MIT © GattyWorks
