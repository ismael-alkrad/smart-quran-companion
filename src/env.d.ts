/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_QURAN_FONT_SOURCE?: 'cdn' | 'local'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
