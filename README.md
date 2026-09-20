# Smart Quran Companion

Vue 3 + TypeScript + Vite + Capacitor mobile-first Quran companion. The backend is the private `smart_quran` Frappe app.

## Current milestone

The first vertical slice is a real Madani Mushaf reader, starting with page **31**. It uses word-addressable QCF V2 glyphs rather than page images, so later Hifz, weak-spot highlighting and Tasmee can target Quran words.

## Run

```bash
yarn
yarn dev
```

Open `http://localhost:5173/quran/31`. Vite proxies `/api` to `http://quran.localhost:8000`.

## Quran rendering contract

- QCF V2 / Madani 604-page Mushaf.
- Quran content comes through the Frappe backend from Quran Foundation Content APIs.
- Page-specific QCF V2 fonts come from Quran Foundation.
- Quran containers use `translate="no"`; automatic Google translation is disabled.
- Quran Foundation client secrets never reach browser/mobile code.
- Every rendered word retains verse key and word location.
- App-bundled font binaries are excluded from git.

## Mobile shells

```bash
yarn build
yarn cap add android
yarn cap add ios
yarn cap:sync
```

iOS requires macOS/Xcode.

## Credits

Quran fonts provided by Quran Foundation.
