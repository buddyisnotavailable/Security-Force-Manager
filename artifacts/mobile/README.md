# Mobile Expo App

## Run in Expo Go

1. Install dependencies
```bash
cd artifacts/mobile
pnpm install
```

2. Start the Expo server
```bash
pnpm start
```

3. Open Expo Go on your Android or iOS device
- Scan the QR code shown in the terminal or browser
- If QR scanning fails, use the tunnel option:
```bash
pnpm start:tunnel
```

## Notes
- `expo start` will launch the standard Expo development server for Expo Go.
- `expo-router` and the managed Expo SDK are already configured for this app.
- If you need native modules not included in Expo Go, use a development build with EAS:
```bash
pnpm exec eas build --profile development --platform all
```

## Build profiles
- `pnpm exec eas build -p android --profile production`
- `pnpm exec eas build -p ios --profile production`
