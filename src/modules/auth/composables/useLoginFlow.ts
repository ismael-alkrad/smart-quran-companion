import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthMutation } from '@/modules/auth/api'
import { useAuthSession } from '@/modules/auth/composables/useAuthSession'
import {
  buildLoginErrorLocation,
  buildLoginLocation,
  buildOAuthErrorLocation,
  getSafeInternalRedirect,
  resolvePostAuthDestination,
} from '@/modules/auth/navigation'
import { useAuthFlowStore } from '@/modules/auth/stores'

export function useLoginFlow() {
  const route = useRoute()
  const router = useRouter()
  const authFlow = useAuthFlowStore()

  const email = computed({
    get: () => authFlow.email,
    set: (value: string) => authFlow.setEmail(value),
  })
  const password = ref('')
  const requestError = ref<string>()

  const loginCall = useAuthMutation('login')
  const oauthLinkCall = useAuthMutation('oauthLink')
  const {
    loading: sessionLoading,
    refreshSession,
    logout,
  } = useAuthSession()

  const loading = computed(
    () =>
      loginCall.loading
      || oauthLinkCall.loading
      || sessionLoading.value,
  )

  const routeEmail = route.query.email
  if (!email.value && typeof routeEmail === 'string') {
    authFlow.setEmail(routeEmail)
  }

  const routeRedirect = getSafeInternalRedirect(route.query.redirect)
  if (routeRedirect) {
    authFlow.setPostAuthRedirect(routeRedirect)
  }

  async function finishAuthenticatedLogin() {
    const session = await refreshSession()

    if (!session?.authenticated) {
      requestError.value =
        'تعذر تأكيد الجلسة بعد تسجيل الدخول. حاول مرة أخرى.'
      return
    }

    if (authFlow.oauthLinkToken) {
      const linkToken = authFlow.oauthLinkToken
      const linkProvider = authFlow.oauthProvider || undefined
      const linkEmail = authFlow.oauthLinkEmail

      const linkResponse = await oauthLinkCall.submit({
        link_token: linkToken,
      })

      if (linkResponse?.ok && linkResponse.status === 'linked') {
        const destination = resolvePostAuthDestination(
          authFlow.postAuthRedirect,
        )

        password.value = ''
        authFlow.reset()
        void router.replace(destination)
        return
      }

      if (linkResponse?.status === 'account_mismatch') {
        await logout()
        password.value = ''

        if (linkEmail) {
          authFlow.setEmail(linkEmail)
        }

        requestError.value =
          'سجّل الدخول بالحساب الحالي المرتبط بهذا البريد لإكمال الربط.'
        return
      }

      await logout()
      password.value = ''
      authFlow.clearOAuthState()

      const reason =
        linkResponse?.status === 'account_unavailable'
          ? 'account_unavailable'
          : linkResponse?.status === 'provider_already_linked'
            || linkResponse?.status === 'identity_already_linked'
            ? 'provider_already_linked'
            : linkResponse?.status === 'authentication_required'
              ? 'session_failed'
              : 'invalid_state'

      void router.replace(
        buildOAuthErrorLocation(
          linkResponse?.provider ?? linkProvider,
          reason,
        ),
      )
      return
    }

    const destination = resolvePostAuthDestination(
      authFlow.postAuthRedirect,
    )

    password.value = ''
    authFlow.reset()
    void router.replace(destination)
  }

  async function login() {
    requestError.value = undefined

    const response = await loginCall.submit({
      email: email.value,
      password: password.value,
    })

    if (response?.ok && response.status === 'authenticated') {
      await finishAuthenticatedLogin()
      return
    }

    if (response?.status === 'invalid_credentials') {
      password.value = ''
      void router.replace(
        buildLoginErrorLocation(authFlow.postAuthRedirect),
      )
      return
    }

    if (response?.status === 'password_reset_required') {
      password.value = ''
      void router.replace('/auth/forgot-password')
      return
    }

    if (response?.status === 'second_factor_required') {
      password.value = ''
      requestError.value =
        'هذا الحساب يتطلب خطوة تحقق إضافية قبل تسجيل الدخول.'
      return
    }

    requestError.value =
      'تعذر إكمال تسجيل الدخول الآن. حاول مرة أخرى.'
  }

  function goToLogin() {
    void router.push(
      buildLoginLocation(authFlow.postAuthRedirect),
    )
  }

  function goToWelcome() {
    if (authFlow.oauthLinkToken) {
      authFlow.clearOAuthState()
    }

    void router.push('/auth')
  }

  function goToRegister() {
    if (authFlow.oauthLinkToken) {
      authFlow.clearOAuthState()
    }

    void router.push('/auth/register')
  }

  function goToForgotPassword() {
    void router.push('/auth/forgot-password')
  }

  return {
    email,
    password,
    requestError,
    loading,
    login,
    goToLogin,
    goToWelcome,
    goToRegister,
    goToForgotPassword,
  }
}
