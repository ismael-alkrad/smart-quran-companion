import type { OAuthPlatform, OAuthProvider } from '@/modules/auth/types/oauth'

export interface AuthRegisterParams extends Record<string, unknown> {
  email: string
  password: string
}

export interface AuthEmailParams extends Record<string, unknown> {
  email: string
}

export interface AuthVerificationParams extends AuthEmailParams {
  code: string
}

export interface AuthLoginParams extends AuthRegisterParams {}

export interface AuthResetPasswordParams extends AuthVerificationParams {
  password: string
}

export interface AuthOAuthStartParams extends Record<string, unknown> {
  provider: OAuthProvider
  code_challenge: string
  platform: OAuthPlatform
}

export interface AuthOAuthCompleteParams extends Record<string, unknown> {
  state: string
  code_verifier: string
}

export interface AuthOAuthLinkParams extends Record<string, unknown> {
  link_token: string
}

export interface AuthStatusResponse<TStatus extends string> {
  ok: boolean
  status: TStatus
}

export interface AuthExpiringStatusResponse<TStatus extends string>
  extends AuthStatusResponse<TStatus> {
  expires_in: number
}

export interface AuthRegisterResponse
  extends AuthStatusResponse<'verification_required' | 'email_already_used'> {
  email: string
  expires_in?: number
}

export type AuthVerificationResponse = AuthStatusResponse<
  'verified' | 'invalid_or_expired_code'
>

export type AuthResendVerificationResponse =
  AuthExpiringStatusResponse<'sent'>

export type AuthLoginResponse =
  | {
      ok: true
      status: 'authenticated'
      user: string
    }
  | {
      ok: false
      status:
        | 'invalid_credentials'
        | 'second_factor_required'
        | 'password_reset_required'
        | 'authentication_incomplete'
    }

export type AuthLogoutResponse = AuthStatusResponse<'logged_out'>

export type AuthPasswordResetRequestResponse =
  AuthExpiringStatusResponse<'sent'>

export type AuthPasswordResetResponse = AuthStatusResponse<
  'password_updated' | 'invalid_or_expired_code'
>

export type AuthOAuthStartResponse =
  | {
      ok: true
      status: 'authorization_required'
      provider: OAuthProvider
      authorization_url: string
      pkce_required: boolean
      expires_in: number
    }
  | {
      ok: false
      status:
        | 'invalid_provider'
        | 'invalid_platform'
        | 'provider_unavailable'
        | 'invalid_pkce_challenge'
      provider?: OAuthProvider
    }

export type AuthOAuthCompleteResponse =
  | {
      ok: true
      status: 'authenticated'
      provider: OAuthProvider
      user: string
      new_user: boolean
    }
  | {
      ok: false
      status: 'account_link_required'
      provider: OAuthProvider
      email: string
      link_token: string
      expires_in: number
    }
  | {
      ok: false
      status:
        | 'invalid_or_expired_oauth_state'
        | 'invalid_provider'
        | 'provider_unavailable'
        | 'invalid_pkce_verifier'
        | 'token_exchange_failed'
        | 'identity_verification_failed'
        | 'account_unavailable'
        | 'provider_already_linked'
      provider?: OAuthProvider
    }

export type AuthOAuthLinkResponse =
  | {
      ok: true
      status: 'linked'
      provider: OAuthProvider
      user: string
    }
  | {
      ok: false
      status:
        | 'link_expired'
        | 'authentication_required'
        | 'account_mismatch'
        | 'account_unavailable'
        | 'identity_already_linked'
        | 'provider_already_linked'
      provider?: OAuthProvider
    }

export interface AuthSessionUser {
  name: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  user_image?: string | null
  user_type?: string | null
}

export type AuthSessionStatusResponse =
  | {
      ok: true
      authenticated: false
      expired: boolean
      user?: never
      csrf_token: string
    }
  | {
      ok: true
      authenticated: true
      expired: false
      user: AuthSessionUser | null
      csrf_token: string
    }

export interface AuthMutationContract {
  register: {
    params: AuthRegisterParams
    response: AuthRegisterResponse
  }
  verifyEmail: {
    params: AuthVerificationParams
    response: AuthVerificationResponse
  }
  resendVerificationCode: {
    params: AuthEmailParams
    response: AuthResendVerificationResponse
  }
  login: {
    params: AuthLoginParams
    response: AuthLoginResponse
  }
  logout: {
    params: Record<string, never>
    response: AuthLogoutResponse
  }
  requestPasswordReset: {
    params: AuthEmailParams
    response: AuthPasswordResetRequestResponse
  }
  resetPassword: {
    params: AuthResetPasswordParams
    response: AuthPasswordResetResponse
  }
  oauthStart: {
    params: AuthOAuthStartParams
    response: AuthOAuthStartResponse
  }
  oauthComplete: {
    params: AuthOAuthCompleteParams
    response: AuthOAuthCompleteResponse
  }
  oauthLink: {
    params: AuthOAuthLinkParams
    response: AuthOAuthLinkResponse
  }
}

export type AuthMutationKey = keyof AuthMutationContract
export type AuthMutationParams<K extends AuthMutationKey> =
  AuthMutationContract[K]['params']
export type AuthMutationResponse<K extends AuthMutationKey> =
  AuthMutationContract[K]['response']
