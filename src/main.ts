import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/app/router'
import '@/styles/app.css'

const app = createApp(App)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 300_000, retry: 1, refetchOnWindowFocus: false },
  },
})

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClient })
app.mount('#app')
