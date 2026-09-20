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

export type AuthLoginResponse = AuthStatusResponse<
  'authenticated' | 'invalid_credentials'
> & {
  user?: string
}

export type AuthLogoutResponse = AuthStatusResponse<'logged_out'>

export type AuthPasswordResetRequestResponse =
  AuthExpiringStatusResponse<'sent'>

export type AuthPasswordResetResponse = AuthStatusResponse<
  'password_updated' | 'invalid_or_expired_code'
>

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
      user?: never
    }
  | {
      ok: true
      authenticated: true
      user: AuthSessionUser | null
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
}

export type AuthMutationKey = keyof AuthMutationContract
export type AuthMutationParams<K extends AuthMutationKey> =
  AuthMutationContract[K]['params']
export type AuthMutationResponse<K extends AuthMutationKey> =
  AuthMutationContract[K]['response']
