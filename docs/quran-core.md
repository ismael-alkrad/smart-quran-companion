# Offline Quran Core

The Mushaf is application content, not backend content.

## Runtime boundary

```text
Vue / Capacitor
  -> local page JSON
  -> local QCF V2 page font

Frappe
  -> users
  -> progress
  -> Hifz / Muraja'ah
  -> Tasmee metadata
  -> groups / sync
```

Opening the Quran must not require a Frappe request or an Internet connection.

## Canonical source packages

The preparation pipeline expects two matching downloadable QUL resources:

1. **KFGQPC V2 layout (1421H print)** — resource 10.
2. **QPC V2 Glyph - Word by Word** — resource 61.
3. **QPC V2 Font** — resource 249, WOFF2 package.

The layout is 604 pages with 15 lines per page. Its `pages` table maps each printed line to a range of Quran word IDs. The word-by-word script database maps those IDs to QPC V2 glyph text.

## Prepare

After downloading the resources from QUL:

```bash
yarn quran:prepare -- \
  --layout .quran-source/kfgqpc-v2-layout.db \
  --script .quran-source/qpc-v2-word-by-word.db \
  --fonts .quran-source/qpc-v2-woff2.zip

yarn quran:verify
```

The generated files live under `public/quran/core` and `public/quran/fonts/v2`. They are intentionally ignored by Git because the public repository should not become a standalone redistribution package for third-party Quran assets.

## Rendering

Each Quran word remains individually addressable:

```text
location = surah:ayah:word
verseKey = surah:ayah
position = word position in ayah
pageNumber
lineNumber
codeV2
```

This contract is required for future Hifz strength, weak spots, audio follow-along, bookmarks and Tasmee highlighting.

QCF V2 glyph strings are rendered with `v-html` against trusted local data because the glyph codes are PUA characters and must be interpreted with the page-specific font.

## Licensing

QUL explicitly describes its resources as downloadable datasets intended to be packaged into projects, but it also states that copyright/license status varies by resource. Keep the source packages and generated binaries out of the public Git repository, retain source/credit metadata, and confirm production redistribution terms for the exact resources before App Store/Play Store release.
