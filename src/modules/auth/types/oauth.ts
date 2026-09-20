export type OAuthProvider = 'google' | 'apple'
export type OAuthPlatform = 'web' | 'ios' | 'android'

export type OAuthFailureReason =
  | 'cancelled'
  | 'invalid_state'
  | 'provider_unavailable'
  | 'provider_error'
  | 'token_exchange_failed'
  | 'identity_verification_failed'
  | 'account_unavailable'
  | 'provider_already_linked'
  | 'session_failed'
  | 'unknown'
