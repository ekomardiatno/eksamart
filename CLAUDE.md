# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Eksamart is a React Native mobile POS (Point of Sale) application for local inventory and sales management. The app is entirely offline — all data is persisted via AsyncStorage with no backend API. UI text is in Indonesian.

## Common Commands

```bash
# Start Metro bundler
npm start

# Run on Android/iOS
npm run android
npm run ios

# Lint
npm run lint

# Run tests
npm test
```

## Architecture

**Stack:** React 19 + React Native 0.80 + TypeScript (mixed with JS)

**Navigation:** React Navigation native-stack. All routes defined in `App.tsx` via `RootStackParamList`. Use the typed hooks `useAppNavigation` and `useAppRoute` from `app/hooks/`.

**Data persistence:** AsyncStorage with four main keys:
- `produk` — product catalog (name, price, stock, barcode)
- `keranjang` — shopping cart
- `penjualan` — individual sale line items
- `transaksi` — completed transaction records

**Component patterns:** Most screens are React class components with `StyleSheet` and `Animated` API. Scanner screen (`Scanner.tsx`) is a functional component using react-native-vision-camera.

## Key Directories

- `app/screens/` — 14 screen components (Dashboard, Scanner, Cart, ProductList, Stock, Pembayaran, Struk, etc.)
- `app/components/` — reusable components (ItemCart, ItemProductList) and shared `styles.js`
- `app/hooks/` — typed navigation hooks (TypeScript)
- `app/helpers/` — `numberFormat.js` (thousand separators), `dateFormat.js` (Indonesian date formatting)

## Versioning

Version is managed in `package.json` only. The Android `build.gradle` reads it automatically:
- `versionName` = `package.json` version string
- `versionCode` = `major * 10000 + minor * 100 + patch` (e.g. `1.2.5` → `10205`)

## CI/CD

GitHub Actions workflow (`.github/workflows/android-release.yml`) triggers on release publish with a `v*` tag. It validates the tag matches `package.json` version, then builds AAB + APK and uploads to the GitHub release. Signing secrets (`ANDROID_KEYSTORE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`) are stored in GitHub repository secrets.

## Code Conventions

- Prettier: single quotes, trailing commas, no parens on single arrow params
- ESLint: `@react-native` preset
- TypeScript config extends `@react-native/typescript-config`
- Node ≥18 required
