export type MushafLineType = 'ayah' | 'surah_name' | 'basmallah'

export interface MushafWord {
  id: number
  location: string
  verseKey: string
  position: number
  pageNumber: number
  lineNumber: number
  codeV2: string
  textQpcHafs?: string
  charTypeName?: string
}

export interface MushafLine {
  lineNumber: number
  type: MushafLineType
  centered: boolean
  surahNumber?: number
  words: MushafWord[]
}

export interface MushafChapter {
  number: number
  nameArabic: string
}

export interface MushafPage {
  pageNumber: number
  juzNumber: number | null
  chapters: MushafChapter[]
  lines: MushafLine[]
  source: 'quran-foundation'
  mushaf: 'qcf-v2'
}
