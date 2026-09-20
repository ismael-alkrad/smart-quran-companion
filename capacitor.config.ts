import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'uk.ikrad.smartquran',
  appName: 'Smart Quran Companion',
  webDir: 'dist',
  server: { androidScheme: 'https' },
}

export default config
