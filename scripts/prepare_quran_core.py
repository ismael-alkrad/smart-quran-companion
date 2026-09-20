#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
import sqlite3
import sys
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


PAGE_COUNT = 604
LINES_PER_PAGE = 15

# Standard Madani Mushaf juz start pages.
JUZ_START_PAGES = [
    1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
    202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
    402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Build the offline Smart Quran Core from QUL's KFGQPC V2 layout "
            "SQLite database and QPC V2 word-by-word SQLite database."
        )
    )
    parser.add_argument("--layout", required=True, type=Path, help="QUL KFGQPC V2 layout .db/.sqlite")
    parser.add_argument("--script", required=True, type=Path, help="QUL QPC V2 word-by-word .db/.sqlite")
    parser.add_argument(
        "--fonts",
        type=Path,
        help="Optional QPC V2 WOFF2 directory or ZIP. If provided, fonts are copied into the app bundle.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/quran"),
        help="Output root. Defaults to public/quran.",
    )
    return parser.parse_args()


def table_columns(connection: sqlite3.Connection, table: str) -> set[str]:
    return {str(row[1]) for row in connection.execute(f"PRAGMA table_info({table})")}


def require_columns(connection: sqlite3.Connection, table: str, expected: set[str]) -> None:
    existing = table_columns(connection, table)
    missing = expected - existing
    if missing:
        raise RuntimeError(f"{table} is missing required columns: {', '.join(sorted(missing))}")


def juz_for_page(page_number: int) -> int:
    juz = 1
    for index, start_page in enumerate(JUZ_START_PAGES, start=1):
        if page_number < start_page:
            break
        juz = index
    return juz


def load_words(script_db: Path) -> dict[int, dict]:
    connection = sqlite3.connect(script_db)
    connection.row_factory = sqlite3.Row
    try:
        require_columns(
            connection,
            "words",
            {"id", "location", "surah", "ayah", "word", "text"},
        )
        rows = connection.execute(
            "SELECT id, location, surah, ayah, word, text FROM words ORDER BY id"
        )
        return {int(row["id"]): dict(row) for row in rows}
    finally:
        connection.close()


def load_layout(layout_db: Path) -> dict[int, list[dict]]:
    connection = sqlite3.connect(layout_db)
    connection.row_factory = sqlite3.Row
    try:
        require_columns(
            connection,
            "pages",
            {
                "page_number",
                "line_number",
                "line_type",
                "is_centered",
                "first_word_id",
                "last_word_id",
                "surah_number",
            },
        )
        rows = connection.execute(
            """
            SELECT page_number, line_number, line_type, is_centered,
                   first_word_id, last_word_id, surah_number
            FROM pages
            ORDER BY page_number, line_number
            """
        )
        pages: dict[int, list[dict]] = defaultdict(list)
        for row in rows:
            pages[int(row["page_number"])].append(dict(row))
        return dict(pages)
    finally:
        connection.close()


def build_page(page_number: int, lines: list[dict], words: dict[int, dict]) -> dict:
    chapters: set[int] = set()
    output_lines: list[dict] = []

    for line in lines:
        line_type = str(line["line_type"])
        line_number = int(line["line_number"])
        surah_number = line["surah_number"]
        line_words: list[dict] = []

        if surah_number not in (None, ""):
            chapters.add(int(surah_number))

        if line_type == "ayah":
            first_word_id = int(line["first_word_id"])
            last_word_id = int(line["last_word_id"])

            for word_id in range(first_word_id, last_word_id + 1):
                source = words.get(word_id)
                if source is None:
                    raise RuntimeError(
                        f"Missing word id {word_id} while building page {page_number}, line {line_number}."
                    )

                surah = int(source["surah"])
                ayah = int(source["ayah"])
                position = int(source["word"])
                chapters.add(surah)

                line_words.append(
                    {
                        "id": int(source["id"]),
                        "location": str(source["location"]),
                        "verseKey": f"{surah}:{ayah}",
                        "position": position,
                        "pageNumber": page_number,
                        "lineNumber": line_number,
                        "codeV2": str(source["text"]),
                    }
                )

        output_lines.append(
            {
                "lineNumber": line_number,
                "type": line_type,
                "centered": bool(line["is_centered"]),
                **({"surahNumber": int(surah_number)} if surah_number not in (None, "") else {}),
                "words": line_words,
            }
        )

    return {
        "pageNumber": page_number,
        "juzNumber": juz_for_page(page_number),
        "chapters": sorted(chapters),
        "lines": output_lines,
        "source": "qul-local",
        "mushaf": "qcf-v2",
    }


def find_font_in_directory(root: Path, page: int) -> Path | None:
    names = {
        f"p{page}.woff2",
        f"p{page:03}.woff2",
        f"QCF_P{page:03}.woff2",
        f"QCF2{page:03}.woff2",
    }
    for candidate in root.rglob("*.woff2"):
        if candidate.name in names:
            return candidate
    return None


def copy_fonts(source: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)

    if source.is_dir():
        for page in range(1, PAGE_COUNT + 1):
            font = find_font_in_directory(source, page)
            if font is None:
                raise RuntimeError(f"Could not find WOFF2 font for page {page} in {source}.")
            shutil.copyfile(font, destination / f"p{page}.woff2")
        return

    if source.is_file() and source.suffix.lower() == ".zip":
        with zipfile.ZipFile(source) as archive:
            by_name = {Path(name).name: name for name in archive.namelist() if name.endswith(".woff2")}
            for page in range(1, PAGE_COUNT + 1):
                candidates = [
                    f"p{page}.woff2",
                    f"p{page:03}.woff2",
                    f"QCF_P{page:03}.woff2",
                    f"QCF2{page:03}.woff2",
                ]
                member = next((by_name[name] for name in candidates if name in by_name), None)
                if member is None:
                    raise RuntimeError(f"Could not find WOFF2 font for page {page} in {source}.")
                with archive.open(member) as src, (destination / f"p{page}.woff2").open("wb") as dst:
                    shutil.copyfileobj(src, dst)
        return

    raise RuntimeError("--fonts must point to a directory or ZIP containing QPC V2 WOFF2 fonts.")


def main() -> int:
    args = parse_args()

    for path in (args.layout, args.script):
        if not path.exists():
            raise FileNotFoundError(path)

    words = load_words(args.script)
    pages = load_layout(args.layout)

    missing_pages = [page for page in range(1, PAGE_COUNT + 1) if page not in pages]
    if missing_pages:
        raise RuntimeError(
            f"Layout is incomplete. Missing {len(missing_pages)} pages; first missing page: {missing_pages[0]}."
        )

    pages_dir = args.output / "core" / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)

    for page_number in range(1, PAGE_COUNT + 1):
        page_lines = pages[page_number]
        if len(page_lines) != LINES_PER_PAGE:
            raise RuntimeError(
                f"Page {page_number} has {len(page_lines)} layout lines; expected {LINES_PER_PAGE}."
            )

        page = build_page(page_number, page_lines, words)
        target = pages_dir / f"{page_number:03}.json"
        target.write_text(
            json.dumps(page, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )

    fonts_included = False
    if args.fonts:
        copy_fonts(args.fonts, args.output / "fonts" / "v2")
        fonts_included = True

    manifest = {
        "version": 1,
        "mushaf": "qcf-v2",
        "source": "qul",
        "pages": PAGE_COUNT,
        "linesPerPage": LINES_PER_PAGE,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "fontsIncluded": fonts_included,
    }
    (args.output / "core" / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Built {PAGE_COUNT} offline Mushaf pages in {pages_dir}")
    if fonts_included:
        print("Copied 604 QPC V2 WOFF2 page fonts.")
    else:
        print("Data is ready, but fonts were not copied. Run again with --fonts before using the reader.")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"quran:prepare failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
