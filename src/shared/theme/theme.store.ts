import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { applyDesignTokens, type ResolvedTheme } from '@/shared/theme/tokens'

export type ThemePreference = 'system' | ResolvedTheme

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>('system')
  const systemTheme = ref<ResolvedTheme>('light')

  const resolvedTheme = computed<ResolvedTheme>(() =>
    preference.value === 'system' ? systemTheme.value : preference.value,
  )

  let mediaQuery: MediaQueryList | null = null
  let initialized = false

  const handleSystemThemeChange = (event: MediaQueryListEvent) => {
    systemTheme.value = event.matches ? 'dark' : 'light'
  }

  watch(resolvedTheme, (theme) => {
    if (initialized) applyDesignTokens(theme)
  })

  function initialize() {
    if (initialized || typeof window === 'undefined' || typeof document === 'undefined') return

    try {
      const saved = localStorage.getItem('sqc-theme')
      if (saved === 'system' || saved === 'light' || saved === 'dark') preference.value = saved
    } catch { /* Storage can be unavailable in private browsing. */ }

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemTheme.value = mediaQuery.matches ? 'dark' : 'light'
    initialized = true

    applyDesignTokens(resolvedTheme.value)
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }

  function setPreference(value: ThemePreference) {
    preference.value = value
    try { localStorage.setItem('sqc-theme', value) } catch { /* Keep the current session preference. */ }
  }

  function dispose() {
    mediaQuery?.removeEventListener('change', handleSystemThemeChange)
    mediaQuery = null
    initialized = false
  }

  return {
    preference,
    systemTheme,
    resolvedTheme,
    initialize,
    setPreference,
    dispose,
  }
})
