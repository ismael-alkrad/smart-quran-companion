import type { RouteLocationRaw } from 'vue-router'

import type {
  OAuthFailureReason,
  OAuthProvider,
} from '@/modules/auth/types/oauth'

export const AUTHENTICATED_FALLBACK_ROUTE = '/quran/31'
export const ONBOARDING_ENTRY_ROUTE = '/auth/account-ready'
export const OAUTH_ACCOUNT_LINK_ROUTE = '/auth/oauth/link'

const OAUTH_PROVIDERS = new Set<OAuthProvider>(['google', 'apple'])
const GUEST_AUTH_RETURN_PATHS = new Set([
  '/auth',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/oauth/error',
  '/auth/login-error',
  '/auth/email-already-used',
  '/auth/verification-error',
  '/auth/code-resent',
  '/auth/password-reset-success',
  '/auth/session-expired',
])
const ONBOARDING_RETURN_PATHS = new Set([
  '/auth/account-ready',
  '/auth/setup',
])
const OAUTH_FAILURE_REASONS = new Set<OAuthFailureReason>([
  'cancelled',
  'invalid_state',
  'provider_unavailable',
  'provider_error',
  'token_exchange_failed',
  'identity_verification_failed',
  'account_unavailable',
  'provider_already_linked',
  'session_failed',
  'unknown',
])

function firstQueryValue(value: unknown) {
  return Array.isArray(value) ? value[0] : value
}

export function getSafeInternalRedirect(value: unknown) {
  const candidate = firstQueryValue(value)

  if (
    typeof candidate !== 'string'
    || !candidate.startsWith('/')
    || candidate.startsWith('//')
    || candidate.startsWith('/auth')
  ) {
    return undefined
  }

  return candidate
}

export function getSafeGuestAuthReturn(value: unknown) {
  const candidate = firstQueryValue(value)

  if (
    typeof candidate !== 'string'
    || !candidate.startsWith('/')
    || candidate.startsWith('//')
  ) {
    return undefined
  }

  const path = candidate.split(/[?#]/, 1)[0]

  return path && GUEST_AUTH_RETURN_PATHS.has(path)
    ? candidate
    : undefined
}

export function getSafeOnboardingReturn(value: unknown) {
  const candidate = firstQueryValue(value)

  if (
    typeof candidate !== 'string'
    || !candidate.startsWith('/')
    || candidate.startsWith('//')
  ) {
    return undefined
  }

  const path = candidate.split(/[?#]/, 1)[0]

  return path && ONBOARDING_RETURN_PATHS.has(path)
    ? candidate
    : undefined
}

export function getOAuthProvider(value: unknown): OAuthProvider | undefined {
  const candidate = firstQueryValue(value)

  if (
    typeof candidate === 'string'
    && OAUTH_PROVIDERS.has(candidate as OAuthProvider)
  ) {
    return candidate as OAuthProvider
  }

  return undefined
}

export function getOAuthFailureReason(
  value: unknown,
): OAuthFailureReason {
  const candidate = firstQueryValue(value)

  if (
    typeof candidate === 'string'
    && OAUTH_FAILURE_REASONS.has(candidate as OAuthFailureReason)
  ) {
    return candidate as OAuthFailureReason
  }

  return 'unknown'
}

export function resolvePostAuthDestination(value: unknown) {
  return getSafeInternalRedirect(value) ?? AUTHENTICATED_FALLBACK_ROUTE
}

export function buildLoginLocation(redirect: unknown): RouteLocationRaw {
  const safeRedirect = getSafeInternalRedirect(redirect)

  return {
    path: '/auth/login',
    query: safeRedirect ? { redirect: safeRedirect } : undefined,
  }
}

export function buildLoginErrorLocation(redirect: unknown): RouteLocationRaw {
  const safeRedirect = getSafeInternalRedirect(redirect)

  return {
    path: '/auth/login-error',
    query: safeRedirect ? { redirect: safeRedirect } : undefined,
  }
}

export function buildOAuthErrorLocation(
  provider: OAuthProvider | undefined,
  reason: OAuthFailureReason,
): RouteLocationRaw {
  return {
    path: '/auth/oauth/error',
    query: {
      reason,
      ...(provider ? { provider } : {}),
    },
  }
}

export function buildOAuthAccountLinkLocation(): RouteLocationRaw {
  return OAUTH_ACCOUNT_LINK_ROUTE
}
