import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/quran/31' },
    {
      path: '/auth',
      name: 'auth-welcome',
      component: () => import('@/modules/auth/pages/AuthWelcomePage.vue'),
    },
    {
      path: '/quran/:page(\\d+)',
      name: 'quran-reader',
      component: () => import('@/modules/quran/pages/QuranReaderPage.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
