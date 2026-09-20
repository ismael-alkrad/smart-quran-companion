export type TextDirection = 'rtl'

export function getTextDirection(_locale: string): TextDirection {
  return 'rtl'
}

export function applyDocumentLocale(
  _locale: string,
  root: HTMLElement = document.documentElement,
) {
  root.lang = 'ar'
  root.dir = 'rtl'
}
