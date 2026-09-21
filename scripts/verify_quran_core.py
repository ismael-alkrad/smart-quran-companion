#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


PAGE_COUNT = 604
LINES_PER_PAGE = 15
SURAH_COUNT = 114
ROOT = Path("public/quran")


def fail(message: str) -> None:
    print(f"quran:verify failed: {message}", file=sys.stderr)
    raise SystemExit(1)


manifest_path = ROOT / "core" / "manifest.json"
if not manifest_path.exists():
    fail("manifest.json is missing. Run yarn quran:prepare first.")

manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
if manifest.get("version") != 2:
    fail(
        f"manifest version={manifest.get('version')}; expected 2. "
        "Run yarn quran:prepare to refresh the local Quran Core."
    )

if manifest.get("pages") != PAGE_COUNT:
    fail(f"manifest pages={manifest.get('pages')}; expected {PAGE_COUNT}.")

for page_number in range(1, PAGE_COUNT + 1):
    page_path = ROOT / "core" / "pages" / f"{page_number:03}.json"
    if not page_path.exists():
        fail(f"missing page file {page_path}.")

    page = json.loads(page_path.read_text(encoding="utf-8"))
    lines = page.get("lines", [])
    if not lines or len(lines) > LINES_PER_PAGE:
        fail(f"page {page_number} has invalid line count: {len(lines)}.")

    if page_number not in (1, 2) and len(lines) != LINES_PER_PAGE:
        fail(f"page {page_number} has {len(lines)} lines; expected {LINES_PER_PAGE}.")

    if [line.get("lineNumber") for line in lines] != list(range(1, len(lines) + 1)):
        fail(f"page {page_number} line numbers are not sequential from 1.")

    for line in lines:
        if line.get("type") == "ayah":
            for word in line.get("words", []):
                required = {"id", "location", "verseKey", "position", "codeV2"}
                missing = required - set(word)
                if missing:
                    fail(
                        f"page {page_number}, line {line['lineNumber']} word is missing: "
                        + ", ".join(sorted(missing))
                    )

surahs_path = ROOT / "core" / "surahs.json"
if not surahs_path.exists():
    fail("surahs.json is missing. Run yarn quran:prepare first.")

surah_index = json.loads(surahs_path.read_text(encoding="utf-8"))
if surah_index.get("version") != 2:
    fail(
        f"surahs.json version={surah_index.get('version')}; expected 2. "
        "Run yarn quran:prepare to refresh the ayah page index."
    )

surahs = surah_index.get("surahs", [])
if len(surahs) != SURAH_COUNT:
    fail(f"surahs.json contains {len(surahs)} surahs; expected {SURAH_COUNT}.")

expected_numbers = list(range(1, SURAH_COUNT + 1))
actual_numbers = [surah.get("surahNumber") for surah in surahs]
if actual_numbers != expected_numbers:
    fail("surahs.json surah numbers are not sequential from 1 to 114.")

for surah in surahs:
    surah_number = surah["surahNumber"]
    ayah_count = surah.get("ayahCount")
    first_page = surah.get("firstPage")
    last_page = surah.get("lastPage")
    ayah_start_pages = surah.get("ayahStartPages")

    if not isinstance(ayah_count, int) or ayah_count < 1:
        fail(f"surah {surah_number} has invalid ayahCount={ayah_count}.")

    if (
        not isinstance(first_page, int)
        or not isinstance(last_page, int)
        or first_page < 1
        or last_page > PAGE_COUNT
        or first_page > last_page
    ):
        fail(
            f"surah {surah_number} has invalid page range: "
            f"{first_page}-{last_page}."
        )

    if not isinstance(ayah_start_pages, dict):
        fail(f"surah {surah_number} is missing ayahStartPages.")

    expected_ayah_keys = [str(ayah) for ayah in range(1, ayah_count + 1)]
    if list(ayah_start_pages.keys()) != expected_ayah_keys:
        fail(
            f"surah {surah_number} ayahStartPages keys are not sequential "
            f"from 1 to {ayah_count}."
        )

    for ayah_key, page_number in ayah_start_pages.items():
        if (
            not isinstance(page_number, int)
            or page_number < first_page
            or page_number > last_page
        ):
            fail(
                f"surah {surah_number}, ayah {ayah_key} has invalid "
                f"start page {page_number}."
            )

if not manifest.get("fontsIncluded"):
    fail("manifest says fontsIncluded=false. Prepare the core with --fonts.")

for page_number in range(1, PAGE_COUNT + 1):
    font_path = ROOT / "fonts" / "v2" / f"p{page_number}.woff2"
    if not font_path.exists() or font_path.stat().st_size == 0:
        fail(f"missing/empty font {font_path}.")

print(
    "Quran Core verified: 604 pages, 114 surah metadata records, "
    "QPC V2 layout validated (opening spread exceptions), "
    "word-addressable data, ayah-to-page index, 604 fonts."
)
