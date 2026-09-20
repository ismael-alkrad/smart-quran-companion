import type {
  MushafPage,
  QuranCoreManifest,
  QuranSurahMetadata,
  QuranSurahMetadataIndex,
} from '@/modules/quran/types/mushaf'

const PAGE_COUNT = 604
const SURAH_COUNT = 114
const manifestUrl = '/quran/core/manifest.json'
const surahMetadataUrl = '/quran/core/surahs.json'

export class QuranCoreNotPreparedError extends Error {
  constructor(message = 'Local Quran Core is not prepared yet.') {
    super(message)
    this.name = 'QuranCoreNotPreparedError'
  }
}

function pageUrl(pageNumber: number) {
  return `/quran/core/pages/${String(pageNumber).padStart(3, '0')}.json`
}

export async function getQuranCoreManifest(signal?: AbortSignal): Promise<QuranCoreManifest> {
  const response = await fetch(manifestUrl, { signal, cache: 'no-cache' })

  if (response.status === 404) {
    throw new QuranCoreNotPreparedError(
      'بيانات المصحف المحلية غير مجهزة. شغّل أمر quran:prepare مرة واحدة بعد تنزيل موارد QUL.',
    )
  }

  if (!response.ok) {
    throw new Error(`Unable to load Quran Core manifest (HTTP ${response.status}).`)
  }

  return response.json() as Promise<QuranCoreManifest>
}

export async function getQuranSurahMetadata(
  signal?: AbortSignal,
): Promise<QuranSurahMetadataIndex> {
  await getQuranCoreManifest(signal)

  const response = await fetch(surahMetadataUrl, {
    signal,
    cache: 'force-cache',
  })

  if (response.status === 404) {
    throw new QuranCoreNotPreparedError(
      'فهرس السور المحلي غير مجهز. أعد تشغيل quran:prepare لتوليد بيانات السور.',
    )
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load local Quran surah metadata (HTTP ${response.status}).`,
    )
  }

  const index = (await response.json()) as QuranSurahMetadataIndex

  if (index.surahs.length !== SURAH_COUNT) {
    throw new Error(
      `Quran surah metadata contains ${index.surahs.length} surahs; expected ${SURAH_COUNT}.`,
    )
  }

  return index
}

export async function getQuranSurahMetadataByNumber(
  surahNumber: number,
  signal?: AbortSignal,
): Promise<QuranSurahMetadata> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > SURAH_COUNT) {
    throw new RangeError(`Surah number must be between 1 and ${SURAH_COUNT}.`)
  }

  const index = await getQuranSurahMetadata(signal)
  const surah = index.surahs.find((item) => item.surahNumber === surahNumber)

  if (!surah) {
    throw new Error(`Surah metadata is missing for surah ${surahNumber}.`)
  }

  return surah
}

export async function getMushafPage(pageNumber: number, signal?: AbortSignal): Promise<MushafPage> {
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > PAGE_COUNT) {
    throw new RangeError(`Mushaf page must be between 1 and ${PAGE_COUNT}.`)
  }

  await getQuranCoreManifest(signal)

  const response = await fetch(pageUrl(pageNumber), {
    signal,
    cache: 'force-cache',
  })

  if (response.status === 404) {
    throw new QuranCoreNotPreparedError(
      `صفحة المصحف ${pageNumber} غير موجودة داخل Quran Core المحلي.`,
    )
  }

  if (!response.ok) {
    throw new Error(`Unable to load local Mushaf page ${pageNumber} (HTTP ${response.status}).`)
  }

  return response.json() as Promise<MushafPage>
}
