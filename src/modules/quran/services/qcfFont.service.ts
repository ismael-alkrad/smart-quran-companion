const loadedFonts = new Map<number, Promise<string>>()
const FONT_BASE = 'https://verses.quran.foundation/fonts/quran/hafs/v2/woff2'

function getFontUrl(pageNumber: number) {
  if (import.meta.env.VITE_QURAN_FONT_SOURCE === 'local') {
    return `/quran/fonts/v2/p${pageNumber}.woff2`
  }
  return `${FONT_BASE}/p${pageNumber}.woff2`
}

export function getQcfV2FontFamily(pageNumber: number) {
  return `p${pageNumber}-v2`
}

export async function loadQcfV2PageFont(pageNumber: number): Promise<string> {
  const existing = loadedFonts.get(pageNumber)
  if (existing) return existing

  const promise = (async () => {
    const family = getQcfV2FontFamily(pageNumber)
    const fontFace = new FontFace(family, `url("${getFontUrl(pageNumber)}") format("woff2")`, {
      display: 'block',
    })
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
