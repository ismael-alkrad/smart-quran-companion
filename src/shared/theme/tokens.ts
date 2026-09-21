export type ResolvedTheme = 'light' | 'dark'

export const semanticColors = {
  'Background/Primary': { light: '#f8f5ef', dark: '#151719' },
  'Background/Secondary': { light: '#fffdf8', dark: '#1b1d20' },
  'Background/Tertiary': { light: '#f3efe7', dark: '#22252a' },
  'Background/Elevated': { light: '#fffdf8', dark: '#2a2e34' },
  'Background/Subtle': { light: '#f3efe7', dark: '#22252a' },
  'Background/Inverse': { light: '#211f1c', dark: '#f8f5ef' },

  'Text/Primary': { light: '#211f1c', dark: '#f3efe7' },
  'Text/Secondary': { light: '#655f58', dark: '#d5cabd' },
  'Text/Tertiary': { light: '#8a8177', dark: '#b3a99c' },
  'Text/Disabled': { light: '#b3a99c', dark: '#8a8177' },
  'Text/Inverse': { light: '#fffdf8', dark: '#151719' },
  'Text/Brand': { light: '#536f9f', dark: '#bac7de' },

  'Border/Subtle': { light: '#e7e0d5', dark: '#383d46' },
  'Border/Default': { light: '#d5cabd', dark: '#4b5260' },
  'Border/Strong': { light: '#9eafd0', dark: '#8398bd' },
  'Border/Focus': { light: '#536f9f', dark: '#9eafd0' },

  'Action/Primary': { light: '#536f9f', dark: '#8398bd' },
  'Action/PrimaryPressed': { light: '#405a86', dark: '#536f9f' },
  'Action/Secondary': { light: '#e9eef7', dark: '#2a2e34' },
  'Action/Disabled': { light: '#e7e0d5', dark: '#383d46' },
  'Action/Destructive': { light: '#dc2626', dark: '#f87171' },

  'Status/Success': { light: '#237a63', dark: '#bac7de' },
  'Status/Warning': { light: '#d97706', dark: '#fcd34d' },
  'Status/Error': { light: '#dc2626', dark: '#fca5a5' },
  'Status/Info': { light: '#2563eb', dark: '#bac7de' },

  'QuranState/New/Background': { light: '#f5f5f4', dark: '#22252a' },
  'QuranState/New/Foreground': { light: '#57534e', dark: '#d5cabd' },
  'QuranState/Memorizing/Background': { light: '#f0f8f6', dark: '#22252a' },
  'QuranState/Memorizing/Foreground': { light: '#1e6653', dark: '#bac7de' },
  'QuranState/InitialHifz/Background': { light: '#eff6ff', dark: '#22252a' },
  'QuranState/InitialHifz/Foreground': { light: '#1d4ed8', dark: '#bac7de' },
  'QuranState/PendingTasmee/Background': { light: '#fffbeb', dark: '#2b2415' },
  'QuranState/PendingTasmee/Foreground': { light: '#92400e', dark: '#fcd34d' },
  'QuranState/PendingApproval/Background': { light: '#fff7ed', dark: '#2c2018' },
  'QuranState/PendingApproval/Foreground': { light: '#9a3412', dark: '#fdba74' },
  'QuranState/Approved/Background': { light: '#d8efe8', dark: '#22252a' },
  'QuranState/Approved/Foreground': { light: '#174b3e', dark: '#bac7de' },
  'QuranState/NeedsReview/Background': { light: '#fef2f2', dark: '#2b1a1a' },
  'QuranState/NeedsReview/Foreground': { light: '#b91c1c', dark: '#fca5a5' },
  'QuranState/Mastered/Background': { light: '#bde4d8', dark: '#2a2e34' },
  'QuranState/Mastered/Foreground': { light: '#0e3529', dark: '#e9eef7' },

  'AI/Active/Background': { light: '#f0f8f6', dark: '#22252a' },
  'AI/Active/Foreground': { light: '#1e6653', dark: '#bac7de' },
  'AI/Analyzing/Background': { light: '#eff6ff', dark: '#22252a' },
  'AI/Analyzing/Foreground': { light: '#1d4ed8', dark: '#bac7de' },
  'AI/LowConfidence/Background': { light: '#fffbeb', dark: '#2b2415' },
  'AI/LowConfidence/Foreground': { light: '#92400e', dark: '#fcd34d' },
  'AI/Unavailable/Background': { light: '#f5f5f4', dark: '#22252a' },
  'AI/Unavailable/Foreground': { light: '#57534e', dark: '#b3a99c' },

  'Verification/Self/Background': { light: '#f5f5f4', dark: '#22252a' },
  'Verification/Self/Foreground': { light: '#44403c', dark: '#d5cabd' },
  'Verification/AIAnalyzed/Background': { light: '#eff6ff', dark: '#22252a' },
  'Verification/AIAnalyzed/Foreground': { light: '#1d4ed8', dark: '#bac7de' },
  'Verification/AIHighConfidence/Background': { light: '#f0f8f6', dark: '#22252a' },
  'Verification/AIHighConfidence/Foreground': { light: '#1e6653', dark: '#bac7de' },
  'Verification/HumanVerified/Background': { light: '#bde4d8', dark: '#2a2e34' },
  'Verification/HumanVerified/Foreground': { light: '#0e3529', dark: '#e9eef7' },

  'PotentialIssue/Hesitation/Background': { light: '#fffbeb', dark: '#2b2415' },
  'PotentialIssue/Hesitation/Foreground': { light: '#92400e', dark: '#fcd34d' },
  'PotentialIssue/Substitution/Background': { light: '#fef2f2', dark: '#2b1a1a' },
  'PotentialIssue/Substitution/Foreground': { light: '#b91c1c', dark: '#fca5a5' },
  'PotentialIssue/Missing/Background': { light: '#fee2e2', dark: '#2b1a1a' },
  'PotentialIssue/Missing/Foreground': { light: '#991b1b', dark: '#fecaca' },
  'PotentialIssue/Transition/Background': { light: '#fff7ed', dark: '#2c2018' },
  'PotentialIssue/Transition/Foreground': { light: '#9a3412', dark: '#fdba74' },
  'PotentialIssue/AudioUnclear/Background': { light: '#eff6ff', dark: '#22252a' },
  'PotentialIssue/AudioUnclear/Foreground': { light: '#1d4ed8', dark: '#bac7de' },

  'Toast/Success/Background': { light: '#f0f8f6', dark: '#22252a' },
  'Toast/Success/Foreground': { light: '#1e6653', dark: '#bac7de' },
  'Toast/Info/Background': { light: '#eff6ff', dark: '#22252a' },
  'Toast/Info/Foreground': { light: '#1d4ed8', dark: '#bac7de' },
  'Toast/Warning/Background': { light: '#fffbeb', dark: '#2b2415' },
  'Toast/Warning/Foreground': { light: '#b45309', dark: '#fcd34d' },
  'Toast/Error/Background': { light: '#fef2f2', dark: '#2b1a1a' },
  'Toast/Error/Foreground': { light: '#b91c1c', dark: '#fca5a5' },

  'Overlay/Backdrop': { light: '#0d14122e', dark: '#15171970' },
  'Overlay/GlassSheet': { light: '#fafaf9d6', dark: '#22252adb' },
  'Overlay/GlassBorder': { light: '#ffffff6b', dark: '#8398bd38' },

  'Mushaf/Paper': { light: '#fbf7ef', dark: '#fbf7ef' },
  'Mushaf/Ink': { light: '#2d2822', dark: '#2d2822' },
  'Mushaf/Muted': { light: '#695c4a', dark: '#695c4a' },
  'Mushaf/Border': { light: '#b8a27f', dark: '#b8a27f' },
  'Mushaf/BorderSubtle': { light: '#b8a27f55', dark: '#b8a27f55' },
  'Mushaf/Accent': { light: '#237a63', dark: '#237a63' },
  'Mushaf/Overlay': { light: '#fbf7eff2', dark: '#fbf7eff2' },
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
