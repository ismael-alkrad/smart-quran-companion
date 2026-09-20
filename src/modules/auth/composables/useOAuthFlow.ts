import { Capacitor } from '@capacitor/core'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthMutation } from '@/modules/auth/api'
import { useAuthSession } from '@/modules/auth/composables/useAuthSession'
import {
  getSafeInternalRedirect,
  resolvePostAuthDestination,
} from '@/modules/auth/navigation'
import { createOAuthPkcePair } from '@/modules/auth/oauth/pkce'
import { useAuthFlowStore } from '@/modules/auth/stores'
import type {
  OAuthPlatform,
  OAuthProvider,
} from '@/modules/auth/types/oauth'

export type OAuthCompletionPhase =
  | 'idle'
  | 'connecting'
  | 'authenticated'
  | 'link_required'
  | 'error'

function getOAuthPlatform(): OAuthPlatform {
  const platform = Capacitor.getPlatform()

  if (platform === 'ios' || platform === 'android') {
    return platform
  }

  return 'web'
}

function queryString(value: unknown) {
  const candidate = Array.isArray(value) ? value[0] : value
  return typeof candidate === 'string' ? candidate : ''
}

export function useOAuthFlow() {
  const route = useRoute()
  const router = useRouter()
  const authFlow = useAuthFlowStore()
  const oauthStartCall = useAuthMutation('oauthStart')
  const oauthCompleteCall = useAuthMutation('oauthComplete')
  const { refreshSession } = useAuthSession()

  const oauthError = ref<string>()
  const completionPhase = ref<OAuthCompletionPhase>('idle')

  const starting = computed(() => oauthStartCall.loading)
  const completing = computed(() => oauthCompleteCall.loading)

  async function beginOAuth(provider: OAuthProvider) {
    oauthError.value = undefined

    const routeRedirect = getSafeInternalRedirect(route.query.redirect)
    if (routeRedirect) {
      authFlow.setPostAuthRedirect(routeRedirect)
    }

    const platform = getOAuthPlatform()

    if (platform !== 'web') {
      oauthError.value =
        'تسجيل الدخول الخارجي على تطبيق الهاتف يحتاج متصفح النظام الآمن، ولن نفتح مزود الحساب داخل WebView.'
      return
    }

    try {
      const pkce = await createOAuthPkcePair()
      authFlow.setOAuthAttempt(provider, pkce.verifier)

      const response = await oauthStartCall.submit({
        provider,
        code_challenge: pkce.challenge,
        platform,
      })

      if (
        response?.ok
        && response.status === 'authorization_required'
      ) {
        window.location.assign(response.authorization_url)
        return
      }

      authFlow.clearOAuthState()
      oauthError.value =
        'تعذر بدء تسجيل الدخول باستخدام مزود الحساب الآن. حاول مرة أخرى.'
    } catch {
      authFlow.clearOAuthState()
      oauthError.value =
        'تعذر بدء تسجيل الدخول الآمن على هذا الجهاز. حاول مرة أخرى.'
    }
  }

  async function completeOAuthCallback() {
    completionPhase.value = 'connecting'
    oauthError.value = undefined

    if (queryString(route.query.oauth_error)) {
      authFlow.clearOAuthState()
      completionPhase.value = 'error'
      oauthError.value =
        'لم يكتمل تسجيل الدخول باستخدام مزود الحساب.'
      return
    }

    const state = queryString(route.query.state)
    if (!state) {
      authFlow.clearOAuthState()
      completionPhase.value = 'error'
      oauthError.value =
        'محاولة تسجيل الدخول غير صالحة أو انتهت صلاحيتها.'
      return
    }

    const response = await oauthCompleteCall.submit({
      state,
      code_verifier: authFlow.oauthCodeVerifier,
    })

    if (response?.ok && response.status === 'authenticated') {
      const session = await refreshSession()

      if (!session?.authenticated) {
        authFlow.clearOAuthState()
        completionPhase.value = 'error'
        oauthError.value =
          'اكتمل تسجيل الدخول، لكن تعذر إنشاء الجلسة المحلية.'
        return
      }

      authFlow.clearOAuthState()
      completionPhase.value = 'authenticated'

      if (response.new_user) {
        void router.replace('/auth/account-ready')
        return
      }

      const destination = resolvePostAuthDestination(
        authFlow.postAuthRedirect,
      )

      authFlow.reset()
      void router.replace(destination)
      return
    }

    if (
      response
      && !response.ok
      && response.status === 'account_link_required'
    ) {
      authFlow.setOAuthLink(
        response.provider,
        response.email,
        response.link_token,
      )
      completionPhase.value = 'link_required'
      return
    }

    authFlow.clearOAuthState()
    completionPhase.value = 'error'
    oauthError.value =
      'تعذر إكمال تسجيل الدخول باستخدام مزود الحساب.'
  }

  return {
    oauthError,
    completionPhase,
    starting,
    completing,
    beginOAuth,
    completeOAuthCallback,
  }
}
