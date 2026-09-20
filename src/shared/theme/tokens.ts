export type ResolvedTheme = 'light' | 'dark'

export const semanticColors = {
  'Background/Primary': { light: '#fafaf9', dark: '#0d1412' },
  'Background/Secondary': { light: '#ffffff', dark: '#121b18' },
  'Background/Tertiary': { light: '#f5f5f4', dark: '#1d2925' },
  'Background/Elevated': { light: '#ffffff', dark: '#18231f' },
  'Background/Subtle': { light: '#f5f5f4', dark: '#1d2925' },
  'Background/Inverse': { light: '#1c1917', dark: '#eef3f1' },

  'Text/Primary': { light: '#1c1917', dark: '#eef3f1' },
  'Text/Secondary': { light: '#57534e', dark: '#b8c5c0' },
  'Text/Tertiary': { light: '#78716c', dark: '#87958f' },
  'Text/Disabled': { light: '#a8a29e', dark: '#5f6d68' },
  'Text/Inverse': { light: '#ffffff', dark: '#0d1412' },
  'Text/Brand': { light: '#1e6653', dark: '#99d4c2' },

  'Border/Subtle': { light: '#e7e5e4', dark: '#1d2925' },
  'Border/Default': { light: '#d6d3d1', dark: '#2d3b36' },
  'Border/Strong': { light: '#78716c', dark: '#5f6d68' },
  'Border/Focus': { light: '#237a63', dark: '#5eb79d' },

  'Action/Primary': { light: '#237a63', dark: '#5eb79d' },
  'Action/PrimaryPressed': { light: '#1e6653', dark: '#298e73' },
  'Action/Secondary': { light: '#f0f8f6', dark: '#10271f' },
  'Action/Disabled': { light: '#e7e5e4', dark: '#1d2925' },
  'Action/Destructive': { light: '#dc2626', dark: '#f87171' },

  'Status/Success': { light: '#237a63', dark: '#99d4c2' },
  'Status/Warning': { light: '#d97706', dark: '#fcd34d' },
  'Status/Error': { light: '#dc2626', dark: '#fca5a5' },
  'Status/Info': { light: '#2563eb', dark: '#93c5fd' },

  'QuranState/New/Background': { light: '#f5f5f4', dark: '#1d2925' },
  'QuranState/New/Foreground': { light: '#57534e', dark: '#b8c5c0' },
  'QuranState/Memorizing/Background': { light: '#f0f8f6', dark: '#10271f' },
  'QuranState/Memorizing/Foreground': { light: '#1e6653', dark: '#99d4c2' },
  'QuranState/InitialHifz/Background': { light: '#eff6ff', dark: '#152438' },
  'QuranState/InitialHifz/Foreground': { light: '#1d4ed8', dark: '#93c5fd' },
  'QuranState/PendingTasmee/Background': { light: '#fffbeb', dark: '#2b2415' },
  'QuranState/PendingTasmee/Foreground': { light: '#92400e', dark: '#fcd34d' },
  'QuranState/PendingApproval/Background': { light: '#fff7ed', dark: '#2c2018' },
  'QuranState/PendingApproval/Foreground': { light: '#9a3412', dark: '#fdba74' },
  'QuranState/Approved/Background': { light: '#d8efe8', dark: '#10271f' },
  'QuranState/Approved/Foreground': { light: '#174b3e', dark: '#99d4c2' },
  'QuranState/NeedsReview/Background': { light: '#fef2f2', dark: '#2b1a1a' },
  'QuranState/NeedsReview/Foreground': { light: '#b91c1c', dark: '#fca5a5' },
  'QuranState/Mastered/Background': { light: '#bde4d8', dark: '#10271f' },
  'QuranState/Mastered/Foreground': { light: '#0e3529', dark: '#bde4d8' },

  'AI/Active/Background': { light: '#f0f8f6', dark: '#10271f' },
  'AI/Active/Foreground': { light: '#1e6653', dark: '#99d4c2' },
  'AI/Analyzing/Background': { light: '#eff6ff', dark: '#152438' },
  'AI/Analyzing/Foreground': { light: '#1d4ed8', dark: '#93c5fd' },
  'AI/LowConfidence/Background': { light: '#fffbeb', dark: '#2b2415' },
  'AI/LowConfidence/Foreground': { light: '#92400e', dark: '#fcd34d' },
  'AI/Unavailable/Background': { light: '#f5f5f4', dark: '#1d2925' },
  'AI/Unavailable/Foreground': { light: '#57534e', dark: '#87958f' },

  'Verification/Self/Background': { light: '#f5f5f4', dark: '#1d2925' },
  'Verification/Self/Foreground': { light: '#44403c', dark: '#b8c5c0' },
  'Verification/AIAnalyzed/Background': { light: '#eff6ff', dark: '#152438' },
  'Verification/AIAnalyzed/Foreground': { light: '#1d4ed8', dark: '#93c5fd' },
  'Verification/AIHighConfidence/Background': { light: '#f0f8f6', dark: '#10271f' },
  'Verification/AIHighConfidence/Foreground': { light: '#1e6653', dark: '#99d4c2' },
  'Verification/HumanVerified/Background': { light: '#bde4d8', dark: '#174b3e' },
  'Verification/HumanVerified/Foreground': { light: '#0e3529', dark: '#f0f8f6' },

  'PotentialIssue/Hesitation/Background': { light: '#fffbeb', dark: '#2b2415' },
  'PotentialIssue/Hesitation/Foreground': { light: '#92400e', dark: '#fcd34d' },
  'PotentialIssue/Substitution/Background': { light: '#fef2f2', dark: '#2b1a1a' },
  'PotentialIssue/Substitution/Foreground': { light: '#b91c1c', dark: '#fca5a5' },
  'PotentialIssue/Missing/Background': { light: '#fee2e2', dark: '#2b1a1a' },
  'PotentialIssue/Missing/Foreground': { light: '#991b1b', dark: '#fecaca' },
  'PotentialIssue/Transition/Background': { light: '#fff7ed', dark: '#2c2018' },
  'PotentialIssue/Transition/Foreground': { light: '#9a3412', dark: '#fdba74' },
  'PotentialIssue/AudioUnclear/Background': { light: '#eff6ff', dark: '#152438' },
  'PotentialIssue/AudioUnclear/Foreground': { light: '#1d4ed8', dark: '#93c5fd' },

  'Toast/Success/Background': { light: '#f0f8f6', dark: '#10271f' },
  'Toast/Success/Foreground': { light: '#1e6653', dark: '#99d4c2' },
  'Toast/Info/Background': { light: '#eff6ff', dark: '#152438' },
  'Toast/Info/Foreground': { light: '#1d4ed8', dark: '#93c5fd' },
  'Toast/Warning/Background': { light: '#fffbeb', dark: '#2b2415' },
  'Toast/Warning/Foreground': { light: '#b45309', dark: '#fcd34d' },
  'Toast/Error/Background': { light: '#fef2f2', dark: '#2b1a1a' },
  'Toast/Error/Foreground': { light: '#b91c1c', dark: '#fca5a5' },

  'Overlay/Backdrop': { light: '#0d14122e', dark: '#0509085c' },
  'Overlay/GlassSheet': { light: '#fafaf9d6', dark: '#121b18c7' },
  'Overlay/GlassBorder': { light: '#ffffff6b', dark: '#b8c5c029' },
} as const satisfies Record<string, Record<ResolvedTheme, string>>

export type SemanticColorToken = keyof typeof semanticColors

export const spacingTokens = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
} as const

export const radiusTokens = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  999: 999,
} as const

export const fontFamilyTokens = {
  ui: "'Noto Sans Arabic', system-ui, sans-serif",
  quranPlaceholder: "'Amiri Quran', serif",
} as const

export const fontWeightTokens = {
  regular: 400,
  medium: 500,
  semiBold: 600,
} as const

export const typographyTokens = {
  display: { fontSize: 32, lineHeight: 44, fontWeight: fontWeightTokens.semiBold },
  heading1: { fontSize: 24, lineHeight: 36, fontWeight: fontWeightTokens.semiBold },
  heading2: { fontSize: 20, lineHeight: 32, fontWeight: fontWeightTokens.medium },
  heading3: { fontSize: 18, lineHeight: 28, fontWeight: fontWeightTokens.medium },
  title: { fontSize: 16, lineHeight: 26, fontWeight: fontWeightTokens.semiBold },
  bodyLarge: { fontSize: 16, lineHeight: 28, fontWeight: fontWeightTokens.regular },
  body: { fontSize: 14, lineHeight: 24, fontWeight: fontWeightTokens.regular },
  bodySmall: { fontSize: 12, lineHeight: 20, fontWeight: fontWeightTokens.regular },
  label: { fontSize: 12, lineHeight: 18, fontWeight: fontWeightTokens.medium },
} as const

// The Figma file currently defines no local Effect Styles.
// Keep this empty rather than inventing shadows that are not part of the source design.
export const shadowTokens = {} as const

function tokenSegment(value: string) {
  return value.toLowerCase().replaceAll('/', '-').replaceAll(' ', '')
}

function roleSegment(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export function semanticColorCssVariable(token: SemanticColorToken) {
  return `--sqc-color-${tokenSegment(token)}`
}

export function applyDesignTokens(
  theme: ResolvedTheme,
  root: HTMLElement = document.documentElement,
) {
  for (const [token, values] of Object.entries(semanticColors)) {
    root.style.setProperty(
      semanticColorCssVariable(token as SemanticColorToken),
      values[theme],
    )
  }

  for (const [name, value] of Object.entries(spacingTokens)) {
    root.style.setProperty(`--sqc-dimension-spacing-${name}`, `${value}px`)
  }

  for (const [name, value] of Object.entries(radiusTokens)) {
    root.style.setProperty(`--sqc-dimension-radius-${name}`, `${value}px`)
  }

  root.style.setProperty('--sqc-font-family-ui', fontFamilyTokens.ui)
  root.style.setProperty('--sqc-font-family-quran-placeholder', fontFamilyTokens.quranPlaceholder)

  for (const [name, value] of Object.entries(fontWeightTokens)) {
    root.style.setProperty(`--sqc-font-weight-${roleSegment(name)}`, String(value))
  }

  for (const [role, token] of Object.entries(typographyTokens)) {
    const segment = roleSegment(role)
    root.style.setProperty(`--sqc-typography-${segment}-font-size`, `${token.fontSize}px`)
    root.style.setProperty(`--sqc-typography-${segment}-line-height`, `${token.lineHeight}px`)
    root.style.setProperty(`--sqc-typography-${segment}-font-weight`, String(token.fontWeight))
  }

  root.dataset.theme = theme
  root.style.setProperty('color-scheme', theme)
}
