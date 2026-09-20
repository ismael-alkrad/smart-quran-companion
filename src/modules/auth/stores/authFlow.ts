import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { OAuthProvider } from '@/modules/auth/types/oauth'

const AUTH_FLOW_EMAIL_KEY = 'smart-quran.auth-flow.email'
const AUTH_FLOW_REDIRECT_KEY = 'smart-quran.auth-flow.redirect'
const AUTH_FLOW_OAUTH_PROVIDER_KEY = 'smart-quran.auth-flow.oauth-provider'
const AUTH_FLOW_OAUTH_VERIFIER_KEY = 'smart-quran.auth-flow.oauth-verifier'
const AUTH_FLOW_OAUTH_LINK_TOKEN_KEY = 'smart-quran.auth-flow.oauth-link-token'
const AUTH_FLOW_OAUTH_LINK_EMAIL_KEY = 'smart-quran.auth-flow.oauth-link-email'

function readSessionValue(key: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    return window.sessionStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function persistSessionValue(key: string, value: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (value) {
      window.sessionStorage.setItem(key, value)
    } else {
      window.sessionStorage.removeItem(key)
    }
  } catch {
    // Auth flow still works in-memory when sessionStorage is unavailable.
  }
}

function readOAuthProvider(): OAuthProvider | '' {
  const value = readSessionValue(AUTH_FLOW_OAUTH_PROVIDER_KEY)
  return value === 'google' || value === 'apple' ? value : ''
}

export const useAuthFlowStore = defineStore('auth-flow', () => {
  const email = ref(readSessionValue(AUTH_FLOW_EMAIL_KEY))
  const postAuthRedirect = ref(readSessionValue(AUTH_FLOW_REDIRECT_KEY))
  const verificationCode = ref('')
  const passwordResetCode = ref('')
  const oauthProvider = ref<OAuthProvider | ''>(readOAuthProvider())
  const oauthCodeVerifier = ref(readSessionValue(AUTH_FLOW_OAUTH_VERIFIER_KEY))
  const oauthLinkToken = ref(readSessionValue(AUTH_FLOW_OAUTH_LINK_TOKEN_KEY))
  const oauthLinkEmail = ref(readSessionValue(AUTH_FLOW_OAUTH_LINK_EMAIL_KEY))

  function setEmail(value: string) {
    const normalized = value.trim().toLowerCase()
    email.value = normalized
    persistSessionValue(AUTH_FLOW_EMAIL_KEY, normalized)
  }

  function setPostAuthRedirect(value?: string) {
    const normalized = value?.trim() ?? ''
    postAuthRedirect.value = normalized
    persistSessionValue(AUTH_FLOW_REDIRECT_KEY, normalized)
  }

  function clearVerificationCode() {
    verificationCode.value = ''
  }

  function clearPasswordResetCode() {
    passwordResetCode.value = ''
  }

  function setOAuthAttempt(provider: OAuthProvider, codeVerifier: string) {
    oauthProvider.value = provider
    oauthCodeVerifier.value = codeVerifier
    oauthLinkToken.value = ''
    oauthLinkEmail.value = ''

    persistSessionValue(AUTH_FLOW_OAUTH_PROVIDER_KEY, provider)
    persistSessionValue(AUTH_FLOW_OAUTH_VERIFIER_KEY, codeVerifier)
    persistSessionValue(AUTH_FLOW_OAUTH_LINK_TOKEN_KEY, '')
    persistSessionValue(AUTH_FLOW_OAUTH_LINK_EMAIL_KEY, '')
  }

  function setOAuthLink(
    provider: OAuthProvider,
    emailValue: string,
    linkToken: string,
  ) {
    oauthProvider.value = provider
    oauthCodeVerifier.value = ''
    oauthLinkEmail.value = emailValue.trim().toLowerCase()
    oauthLinkToken.value = linkToken

    persistSessionValue(AUTH_FLOW_OAUTH_PROVIDER_KEY, provider)
    persistSessionValue(AUTH_FLOW_OAUTH_VERIFIER_KEY, '')
    persistSessionValue(AUTH_FLOW_OAUTH_LINK_EMAIL_KEY, oauthLinkEmail.value)
    persistSessionValue(AUTH_FLOW_OAUTH_LINK_TOKEN_KEY, linkToken)
  }

  function clearOAuthState() {
    oauthProvider.value = ''
    oauthCodeVerifier.value = ''
    oauthLinkToken.value = ''
    oauthLinkEmail.value = ''

    persistSessionValue(AUTH_FLOW_OAUTH_PROVIDER_KEY, '')
    persistSessionValue(AUTH_FLOW_OAUTH_VERIFIER_KEY, '')
    persistSessionValue(AUTH_FLOW_OAUTH_LINK_TOKEN_KEY, '')
    persistSessionValue(AUTH_FLOW_OAUTH_LINK_EMAIL_KEY, '')
  }

  function reset() {
    email.value = ''
    postAuthRedirect.value = ''
    verificationCode.value = ''
    passwordResetCode.value = ''
    persistSessionValue(AUTH_FLOW_EMAIL_KEY, '')
    persistSessionValue(AUTH_FLOW_REDIRECT_KEY, '')
    clearOAuthState()
  }

  return {
    email,
    postAuthRedirect,
    verificationCode,
    passwordResetCode,
    oauthProvider,
    oauthCodeVerifier,
    oauthLinkToken,
    oauthLinkEmail,
    setEmail,
    setPostAuthRedirect,
    clearVerificationCode,
    clearPasswordResetCode,
    setOAuthAttempt,
    setOAuthLink,
    clearOAuthState,
    reset,
  }
})
