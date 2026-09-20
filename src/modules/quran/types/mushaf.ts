export type MushafLineType = 'ayah' | 'surah_name' | 'basmallah'

export interface MushafWord {
  id: number
  location: string
  verseKey: string
  position: number
  pageNumber: number
  lineNumber: number
  codeV2: string
}

export interface MushafLine {
  lineNumber: number
  type: MushafLineType
  centered: boolean
  surahNumber?: number
  words: MushafWord[]
}

export interface MushafPage {
  pageNumber: number
  juzNumber: number
  chapters: number[]
  lines: MushafLine[]
  source: 'qul-local'
  mushaf: 'qcf-v2'
}

export interface QuranCoreManifest {
  version: number
  mushaf: 'qcf-v2'
  source: 'qul'
  pages: number
  linesPerPage: number
  generatedAt: string
  fontsIncluded: boolean
}

export interface QuranSurahMetadata {
  surahNumber: number
  ayahCount: number
  firstPage: number
  lastPage: number
}

export interface QuranSurahMetadataIndex {
  version: number
  source: 'qul'
  mushaf: 'qcf-v2'
  generatedAt: string
  surahs: QuranSurahMetadata[]
}
