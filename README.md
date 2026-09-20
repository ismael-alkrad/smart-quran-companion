# Smart Quran Companion

Mobile-first Quran companion built with Vue 3, TypeScript, Vite and Capacitor. The backend is the private `smart_quran` Frappe app.

## Architecture

The Quran itself is **offline-first application content**. Opening a Mushaf page never calls Frappe.

```text
Vue / Capacitor
  ├─ Local Quran Core
  │   ├─ 604 generated page JSON files
  │   └─ 604 QCF V2 page fonts
  │
  └─ Frappe API
      ├─ Auth
      ├─ Profile
      ├─ Hifz / Muraja'ah progress
      ├─ Tasmee metadata
      ├─ Groups
      └─ Sync
```

The local Quran Core is word-addressable rather than a set of page images. Each rendered word retains its `surah:ayah:word` location, verse key, page and line.

## Run the app

```bash
yarn
yarn dev
```

The default reader route is:

```text
http://localhost:5173/quran/31
```

Before the Mushaf can render, prepare the offline Quran Core.

## Prepare Quran Core

Download these matching QUL resources:

- KFGQPC V2 layout (1421H print): https://qul.tarteel.ai/resources/mushaf-layout/10
- QPC V2 Glyph - Word by Word: https://qul.tarteel.ai/resources/quran-script/61
- QPC V2 Font (WOFF2): https://qul.tarteel.ai/resources/font/249

Place the downloaded files under `.quran-source/` (ignored by git), then run:

```bash
yarn quran:prepare -- \
  --layout .quran-source/kfgqpc-v2-layout.db \
  --script .quran-source/qpc-v2-word-by-word.db \
  --fonts .quran-source/qpc-v2-woff2.zip

yarn quran:verify
```

Use the actual downloaded filenames if QUL names them differently.

The generated Quran data/fonts are also ignored by git. They become normal static assets in the Vite/Capacitor build and therefore work offline at runtime.

See `docs/quran-core.md` for the data contract and architecture.

## Backend development

Vite still proxies `/api` to the local Frappe site for account/progress functionality:

```text
http://quran.localhost:8000
```

The proxy is not involved in rendering Quran pages.

## Mobile shells

```bash
yarn build
yarn cap add android
yarn cap add ios
yarn cap:sync
```

iOS builds require macOS/Xcode.

## Quran resource credits

The Mushaf preparation pipeline is designed around resources from the Quranic Universal Library (QUL) / Tarteel and QPC/KFGQPC. Production releases must retain appropriate credits and comply with the exact resource licensing/redistribution terms.
