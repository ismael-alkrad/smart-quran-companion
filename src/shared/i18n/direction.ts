export type TextDirection = 'ltr' | 'rtl'

const RTL_LANGUAGES = new Set(['ar', 'fa', 'he', 'ur'])

export function getTextDirection(locale: string): TextDirection {
  const language = locale.trim().toLowerCase().split(/[-_]/)[0] ?? ''
  return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
}

export function applyDocumentLocale(
  locale: string,
  root: HTMLElement = document.documentElement,
) {
  root.lang = locale
  root.dir = getTextDirection(locale)
}
