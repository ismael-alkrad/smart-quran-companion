export class QuranFontNotPreparedError extends Error {
  constructor(pageNumber: number) {
    super(
      `QCF V2 font for Mushaf page ${pageNumber} is missing from the local Quran Core assets.`,
    )
    this.name = 'QuranFontNotPreparedError'
  }
}

const loadedFonts = new Map<number, Promise<string>>()

export function getQcfV2FontFamily(pageNumber: number) {
  return `p${pageNumber}-v2`
}

function getLocalFontUrl(pageNumber: number) {
  return `/quran/fonts/v2/p${pageNumber}.woff2`
}

export async function loadQcfV2PageFont(pageNumber: number): Promise<string> {
  const existing = loadedFonts.get(pageNumber)
  if (existing) return existing

  const promise = (async () => {
    const family = getQcfV2FontFamily(pageNumber)
    const response = await fetch(getLocalFontUrl(pageNumber), { cache: 'force-cache' })

    if (!response.ok) {
      throw new QuranFontNotPreparedError(pageNumber)
    }

    const fontData = await response.arrayBuffer()
    const fontFace = new FontFace(family, fontData, { display: 'block' })

    await fontFace.load()
    document.fonts.add(fontFace)

    return family
  })()

  loadedFonts.set(pageNumber, promise)

  try {
    return await promise
  } catch (error) {
    loadedFonts.delete(pageNumber)
    throw error
  }
}
