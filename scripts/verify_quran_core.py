#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path


PAGE_COUNT = 604
LINES_PER_PAGE = 15
ROOT = Path("public/quran")


def fail(message: str) -> None:
    print(f"quran:verify failed: {message}", file=sys.stderr)
    raise SystemExit(1)


manifest_path = ROOT / "core" / "manifest.json"
if not manifest_path.exists():
    fail("manifest.json is missing. Run yarn quran:prepare first.")

manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
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

if not manifest.get("fontsIncluded"):
    fail("manifest says fontsIncluded=false. Prepare the core with --fonts.")

for page_number in range(1, PAGE_COUNT + 1):
    font_path = ROOT / "fonts" / "v2" / f"p{page_number}.woff2"
    if not font_path.exists() or font_path.stat().st_size == 0:
        fail(f"missing/empty font {font_path}.")

print("Quran Core verified: 604 pages, QPC V2 layout validated (opening spread exceptions), word-addressable data, 604 fonts.")
