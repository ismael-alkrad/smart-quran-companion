import { useSmartQuranCall } from '@/shared/api'
import type {
  AuthMutationKey,
  AuthMutationParams,
  AuthMutationResponse,
  AuthSessionStatusResponse,
} from '@/modules/auth/api/contracts'

const AUTH_MUTATION_METHODS = {
  register: 'auth.register',
  verifyEmail: 'auth.verify_email',
  resendVerificationCode: 'auth.resend_verification_code',
  login: 'auth.login',
  logout: 'auth.logout',
  requestPasswordReset: 'auth.request_password_reset',
  resetPassword: 'auth.reset_password',
  oauthStart: 'oauth.start',
  oauthComplete: 'oauth.complete',
  oauthLink: 'oauth.link_account',
} as const satisfies Record<AuthMutationKey, string>

const AUTH_QUERY_METHODS = {
  sessionStatus: 'auth.session_status',
} as const

export function useAuthMutation<K extends AuthMutationKey>(key: K) {
  return useSmartQuranCall<
    AuthMutationResponse<K>,
    AuthMutationParams<K>
  >(AUTH_MUTATION_METHODS[key], {
    method: 'POST',
    immediate: false,
  })
}

export function useAuthSessionStatus() {
  return useSmartQuranCall<AuthSessionStatusResponse>(
    AUTH_QUERY_METHODS.sessionStatus,
    {
      method: 'GET',
      immediate: false,
    },
  )
}
