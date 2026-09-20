import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/app/router'
import { applyDocumentLocale } from '@/shared/i18n/direction'
import { useThemeStore } from '@/shared/theme'
import '@/styles/app.css'

const app = createApp(App)
const pinia = createPinia()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 300_000, retry: 1, refetchOnWindowFocus: false },
  },
})

app.use(pinia)
app.use(router)
app.use(VueQueryPlugin, { queryClient })

applyDocumentLocale('ar')
useThemeStore(pinia).initialize()

app.mount('#app')
