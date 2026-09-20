import { Capacitor } from '@capacitor/core'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthMutation } from '@/modules/auth/api'
import { useAuthSession } from '@/modules/auth/composables/useAuthSession'
import {
  buildOAuthErrorLocation,
  getOAuthFailureReason,
  getOAuthProvider,
  getSafeInternalRedirect,
  resolvePostAuthDestination,
} from '@/modules/auth/navigation'
import { createOAuthPkcePair } from '@/modules/auth/oauth/pkce'
import { useAuthFlowStore } from '@/modules/auth/stores'
import type {
  OAuthFailureReason,
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

  function goToOAuthError(
    provider: OAuthProvider | undefined,
    reason: OAuthFailureReason,
  ) {
    authFlow.clearOAuthState()
    completionPhase.value = 'error'
    void router.replace(buildOAuthErrorLocation(provider, reason))
  }

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

      goToOAuthError(
        provider,
        response?.status === 'provider_unavailable'
          ? 'provider_unavailable'
          : 'provider_error',
      )
    } catch {
      goToOAuthError(provider, 'provider_error')
    }
  }

  async function completeOAuthCallback() {
    completionPhase.value = 'connecting'
    oauthError.value = undefined

    const callbackProvider =
      getOAuthProvider(route.query.provider)
      ?? (authFlow.oauthProvider || undefined)

    if (queryString(route.query.oauth_error)) {
      const reason = getOAuthFailureReason(route.query.oauth_error)
      goToOAuthError(callbackProvider, reason)
      return
    }

    const state = queryString(route.query.state)
    if (!state) {
      goToOAuthError(callbackProvider, 'invalid_state')
      return
    }

    let response

    try {
      response = await oauthCompleteCall.submit({
        state,
        code_verifier: authFlow.oauthCodeVerifier,
      })
    } catch {
      goToOAuthError(callbackProvider, 'provider_error')
      return
    }

    if (response?.ok && response.status === 'authenticated') {
      const session = await refreshSession()

      if (!session?.authenticated) {
        goToOAuthError(response.provider, 'session_failed')
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

    const provider =
      response?.provider
      ?? callbackProvider

    if (!response) {
      goToOAuthError(provider, 'provider_error')
      return
    }

    if (response.status === 'provider_unavailable') {
      goToOAuthError(provider, 'provider_unavailable')
      return
    }

    if (
      response.status === 'invalid_or_expired_oauth_state'
      || response.status === 'invalid_pkce_verifier'
    ) {
      goToOAuthError(provider, 'invalid_state')
      return
    }

    if (response.status === 'token_exchange_failed') {
      goToOAuthError(provider, 'token_exchange_failed')
      return
    }

    if (response.status === 'identity_verification_failed') {
      goToOAuthError(provider, 'identity_verification_failed')
      return
    }

    if (response.status === 'account_unavailable') {
      goToOAuthError(provider, 'account_unavailable')
      return
    }

    if (response.status === 'provider_already_linked') {
      goToOAuthError(provider, 'provider_already_linked')
      return
    }

    goToOAuthError(provider, 'provider_error')
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
