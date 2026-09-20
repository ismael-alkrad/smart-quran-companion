#!/usr/bin/env python3
from __future__ import annotations

import argparse
import bz2
import json
import shutil
import sqlite3
import sys
import tarfile
import tempfile
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
    parser.add_argument(
        "--layout",
        required=True,
        type=Path,
        help="QUL KFGQPC V2 layout .db/.sqlite or .zip containing it.",
    )
    parser.add_argument(
        "--script",
        required=True,
        type=Path,
        help="QUL QPC V2 word-by-word .db/.sqlite or .zip containing it.",
    )
    parser.add_argument(
        "--fonts",
        type=Path,
        help=(
            "QPC V2 WOFF2 package. Accepts a directory, .zip, .tar/.tar.bz2, "
            "or QUL .woff2.bz2 package."
        ),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/quran"),
        help="Output root. Defaults to public/quran.",
    )
    return parser.parse_args()


def _is_sqlite(path: Path) -> bool:
    if not path.is_file():
        return False
    with path.open("rb") as handle:
        return handle.read(16) == b"SQLite format 3\x00"


def resolve_sqlite_source(source: Path, workdir: Path, label: str) -> Path:
    """Return a usable SQLite file from a raw DB or QUL ZIP download."""
    if not source.exists():
        raise FileNotFoundError(source)

    if _is_sqlite(source):
        return source

    if zipfile.is_zipfile(source):
        target_dir = workdir / f"{label}-sqlite"
        target_dir.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(source) as archive:
            candidates = [
                name
                for name in archive.namelist()
                if not name.endswith("/") and Path(name).suffix.lower() in {".db", ".sqlite", ".sqlite3"}
            ]
            if not candidates:
                raise RuntimeError(f"{source} does not contain a SQLite database.")

            # These QUL packages should contain one database. Prefer the shortest path
            # if a metadata folder is present.
            member = sorted(candidates, key=lambda name: (len(Path(name).parts), len(name)))[0]
            extracted = Path(archive.extract(member, target_dir))

        if not _is_sqlite(extracted):
            raise RuntimeError(f"Extracted file from {source} is not a SQLite database.")
        return extracted

    if source.suffix.lower() == ".bz2":
        target = workdir / source.name.removesuffix(".bz2")
        with bz2.open(source, "rb") as src, target.open("wb") as dst:
            shutil.copyfileobj(src, dst)
        if _is_sqlite(target):
            return target

    raise RuntimeError(
        f"{source} is not a SQLite database or a supported compressed SQLite package."
    )


def _font_name_candidates(page: int) -> tuple[str, ...]:
    return (
        f"p{page}.woff2",
        f"p{page:03}.woff2",
        f"QCF_P{page:03}.woff2",
        f"QCF2{page:03}.woff2",
    )


def _copy_fonts_from_directory(root: Path, destination: Path) -> None:
    all_fonts = list(root.rglob("*.woff2"))
    if not all_fonts:
        raise RuntimeError(f"No WOFF2 files were found in {root}.")

    by_name = {font.name.lower(): font for font in all_fonts}
    for page in range(1, PAGE_COUNT + 1):
        source = next(
            (by_name[name.lower()] for name in _font_name_candidates(page) if name.lower() in by_name),
            None,
        )
        if source is None:
            raise RuntimeError(
                f"Font package is incomplete: could not find the WOFF2 font for page {page}."
            )
        shutil.copyfile(source, destination / f"p{page}.woff2")


def _extract_font_package(source: Path, workdir: Path) -> Path:
    """Normalize ZIP/TAR/BZ2 QUL font downloads to an extracted directory."""
    if source.is_dir():
        return source

    if not source.is_file():
        raise FileNotFoundError(source)

    target_dir = workdir / "fonts-package"
    target_dir.mkdir(parents=True, exist_ok=True)

    # Some QUL downloads have changed filename extensions over time. Detect by
    # archive signature/content instead of trusting the filename alone.
    if zipfile.is_zipfile(source):
        with zipfile.ZipFile(source) as archive:
            archive.extractall(target_dir)
        return target_dir

    if tarfile.is_tarfile(source):
        with tarfile.open(source, "r:*") as archive:
            archive.extractall(target_dir, filter="data")
        return target_dir

    if source.suffix.lower() == ".bz2":
        decompressed = workdir / source.name.removesuffix(".bz2")
        with bz2.open(source, "rb") as src, decompressed.open("wb") as dst:
            shutil.copyfileobj(src, dst)

        if zipfile.is_zipfile(decompressed):
            with zipfile.ZipFile(decompressed) as archive:
                archive.extractall(target_dir)
            return target_dir

        if tarfile.is_tarfile(decompressed):
            with tarfile.open(decompressed, "r:*") as archive:
                archive.extractall(target_dir, filter="data")
            return target_dir

        # If the bzip2 payload is one raw WOFF2 file, it cannot be the complete
        # QPC V2 page-by-page package (the Mushaf requires 604 page fonts).
        if decompressed.is_file() and decompressed.read_bytes()[:4] == b"wOF2":
            raise RuntimeError(
                "The .bz2 package expanded to a single WOFF2 file. "
                "QPC V2 requires 604 page-specific fonts. Re-download the QUL "
                "'QPC V2 Font' WOFF2 package and ensure the complete page-by-page archive is selected."
            )

    raise RuntimeError(
        "--fonts must point to a directory or an archive containing all 604 QPC V2 WOFF2 page fonts."
    )


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


def copy_fonts(source: Path, destination: Path, workdir: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    package_dir = _extract_font_package(source, workdir)
    _copy_fonts_from_directory(package_dir, destination)

def main() -> int:
    args = parse_args()

    with tempfile.TemporaryDirectory(prefix="smart-quran-core-") as temp_dir:
        workdir = Path(temp_dir)
        layout_db = resolve_sqlite_source(args.layout, workdir, "layout")
        script_db = resolve_sqlite_source(args.script, workdir, "script")

        words = load_words(script_db)
        pages = load_layout(layout_db)

        missing_pages = [page for page in range(1, PAGE_COUNT + 1) if page not in pages]
        if missing_pages:
            raise RuntimeError(
                f"Layout is incomplete. Missing {len(missing_pages)} pages; "
                f"first missing page: {missing_pages[0]}."
            )

        pages_dir = args.output / "core" / "pages"
        pages_dir.mkdir(parents=True, exist_ok=True)

        for page_number in range(1, PAGE_COUNT + 1):
            page_lines = pages[page_number]

            # QPC V2 is a 15-line Mushaf, but the opening spread is intentionally
            # shorter: page 1 (Al-Fatihah) and page 2 use fewer printed content
            # lines. The QUL layout export stores only real content lines, not
            # synthetic blank rows. All regular pages must still contain 15 rows.
            expected_lines = None if page_number in (1, 2) else LINES_PER_PAGE
            if not page_lines or len(page_lines) > LINES_PER_PAGE:
                raise RuntimeError(
                    f"Page {page_number} has invalid layout line count: {len(page_lines)}."
                )
            if expected_lines is not None and len(page_lines) != expected_lines:
                raise RuntimeError(
                    f"Page {page_number} has {len(page_lines)} layout lines; expected {expected_lines}."
                )

            page = build_page(page_number, page_lines, words)
            target = pages_dir / f"{page_number:03}.json"
            target.write_text(
                json.dumps(page, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )

        fonts_included = False
        if args.fonts:
            copy_fonts(args.fonts, args.output / "fonts" / "v2", workdir)
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
