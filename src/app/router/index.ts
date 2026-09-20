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
      path: '/auth/login',
      name: 'auth-login',
      component: () => import('@/modules/auth/pages/AuthLoginPage.vue'),
    },
    {
      path: '/auth/register',
      name: 'auth-register',
      component: () => import('@/modules/auth/pages/AuthRegisterPage.vue'),
    },
    {
      path: '/auth/verify-email',
      name: 'auth-verify-email',
      component: () => import('@/modules/auth/pages/AuthVerifyEmailPage.vue'),
    },
    {
      path: '/auth/forgot-password',
      name: 'auth-forgot-password',
      component: () => import('@/modules/auth/pages/AuthForgotPasswordPage.vue'),
    },
    {
      path: '/auth/reset-password',
      name: 'auth-reset-password',
      component: () => import('@/modules/auth/pages/AuthResetPasswordPage.vue'),
    },
    {
      path: '/auth/account-ready',
      name: 'auth-account-ready',
      component: () => import('@/modules/auth/pages/AuthAccountReadyPage.vue'),
    },
    {
      path: '/quran/:page(\\d+)',
      name: 'quran-reader',
      component: () => import('@/modules/quran/pages/QuranReaderPage.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
