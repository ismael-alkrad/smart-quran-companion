import { createRouter, createWebHistory } from 'vue-router'

import {
  AUTHENTICATED_FALLBACK_ROUTE,
  ONBOARDING_ENTRY_ROUTE,
} from '@/modules/auth/navigation'
import { useAuthSessionStore } from '@/modules/auth/stores'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/auth',
      name: 'auth-welcome',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthWelcomePage.vue'),
    },
    {
      path: '/auth/login',
      name: 'auth-login',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthLoginPage.vue'),
    },
    {
      path: '/auth/register',
      name: 'auth-register',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthRegisterPage.vue'),
    },
    {
      path: '/auth/verify-email',
      name: 'auth-verify-email',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthVerifyEmailPage.vue'),
    },
    {
      path: '/auth/forgot-password',
      name: 'auth-forgot-password',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthForgotPasswordPage.vue'),
    },
    {
      path: '/auth/reset-password',
      name: 'auth-reset-password',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthResetPasswordPage.vue'),
    },
    {
      path: '/auth/account-ready',
      name: 'auth-account-ready',
      meta: { onboardingOnly: true },
      component: () => import('@/modules/auth/pages/AuthAccountReadyPage.vue'),
    },
    {
      path: '/auth/setup',
      name: 'auth-first-time-setup',
      meta: { onboardingOnly: true },
      component: () => import('@/modules/auth/pages/AuthFirstTimeSetupPage.vue'),
    },
    {
      path: '/auth/startup',
      name: 'auth-startup',
      component: () => import('@/modules/auth/pages/AuthStartupPage.vue'),
    },
    {
      path: '/auth/oauth/connecting',
      name: 'auth-oauth-connecting',
      component: () => import('@/modules/auth/pages/AuthOAuthConnectingPage.vue'),
    },
    {
      path: '/auth/oauth/error',
      name: 'auth-oauth-error',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthOAuthErrorPage.vue'),
    },
    {
      path: '/auth/oauth/link',
      name: 'auth-oauth-link',
      component: () => import('@/modules/auth/pages/AuthAccountLinkingPage.vue'),
    },
    {
      path: '/auth/login-error',
      name: 'auth-login-error',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthLoginErrorPage.vue'),
    },
    {
      path: '/auth/email-already-used',
      name: 'auth-email-already-used',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthEmailAlreadyUsedPage.vue'),
    },
    {
      path: '/auth/verification-error',
      name: 'auth-verification-error',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthVerificationErrorPage.vue'),
    },
    {
      path: '/auth/code-resent',
      name: 'auth-code-resent',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthCodeResentPage.vue'),
    },
    {
      path: '/auth/password-reset-success',
      name: 'auth-password-reset-success',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthPasswordResetSuccessPage.vue'),
    },
    {
      path: '/auth/session-expired',
      name: 'auth-session-expired',
      meta: { guestOnly: true },
      component: () => import('@/modules/auth/pages/AuthSessionExpiredPage.vue'),
    },
    {
      path: '/home',
      name: 'home',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/home/pages/HomePage.vue'),
    },
    {
      path: '/home/default-preview',
      name: 'home-default-preview',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/home/pages/HomeDefaultPage.vue'),
    },
    {
      path: '/home/active-preview',
      name: 'home-active-preview',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/home/pages/HomeActiveDayPage.vue'),
    },
    {
      path: '/home/completed-preview',
      name: 'home-completed-preview',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/home/pages/HomeCompletedDayPage.vue'),
    },
    {
      path: '/quran',
      name: 'quran-hifz-overview',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/quran/pages/QuranHifzOverviewPage.vue'),
    },
    {
      path: '/quran/hifz/daily-plan',
      name: 'quran-daily-hifz-plan',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/quran/pages/QuranDailyHifzPlanPage.vue'),
    },
    {
      path: '/quran/surah/:surahNumber(\\d+)',
      name: 'quran-surah-progress',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/quran/pages/QuranSurahProgressPage.vue'),
    },
    {
      path: '/quran/:page(\\d+)',
      name: 'quran-reader',
      meta: { requiresOnboarding: true },
      component: () => import('@/modules/quran/pages/QuranReaderPage.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const sessionStore = useAuthSessionStore()

  if (to.meta.guestOnly) {
    if (sessionStore.authenticated === true) {
      return {
        path: sessionStore.user?.onboarding_completed
          ? AUTHENTICATED_FALLBACK_ROUTE
          : ONBOARDING_ENTRY_ROUTE,
        replace: true,
      }
    }

    if (sessionStore.authenticated === false) {
      return true
    }

    return {
      path: '/auth/startup',
      query: { returnTo: to.fullPath },
      replace: true,
    }
  }

  if (to.meta.onboardingOnly) {
    if (sessionStore.authenticated === true) {
      if (sessionStore.user?.onboarding_completed) {
        return {
          path: AUTHENTICATED_FALLBACK_ROUTE,
          replace: true,
        }
      }

      return true
    }

    return {
      path: '/auth/startup',
      query: { returnTo: to.fullPath },
      replace: true,
    }
  }

  if (to.meta.requiresOnboarding) {
    if (sessionStore.authenticated === true) {
      if (!sessionStore.user?.onboarding_completed) {
        return {
          path: ONBOARDING_ENTRY_ROUTE,
          replace: true,
        }
      }

      return true
    }

    return {
      path: '/auth/startup',
      query: { redirect: to.fullPath },
      replace: true,
    }
  }

  return true
})

export default router
