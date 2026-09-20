import { fileURLToPath, URL } from 'node:url'

import frappeui from 'frappe-ui/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    frappeui({
      // Keep our explicit Vite proxy because the frontend and Frappe site are
      // separate during development and quran.localhost must be preserved.
      frappeProxy: false,
      jinjaBootData: false,
      buildConfig: false,
    }),
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          Host: 'quran.localhost:8000',
        },
      },
    },
  },
})
