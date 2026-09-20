import type { RouteLocationRaw } from 'vue-router'

export const AUTHENTICATED_FALLBACK_ROUTE = '/quran/31'

export function getSafeInternalRedirect(value: unknown) {
  const candidate = Array.isArray(value) ? value[0] : value

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
