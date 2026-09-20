import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // Browsers treat *.localhost as loopback automatically, but Node/Vite
        // may not resolve quran.localhost on every OS. Connect to loopback
        // explicitly and preserve the Frappe site Host header for site routing.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        headers: {
          Host: 'quran.localhost:8000',
        },
      },
    },
  },
})
