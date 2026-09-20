import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthMutation } from '@/modules/auth/api'
import { useAuthSession } from '@/modules/auth/composables/useAuthSession'
import {
  buildLoginErrorLocation,
  buildLoginLocation,
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
  const {
    loading: sessionLoading,
    refreshSession,
  } = useAuthSession()

  const loading = computed(
    () => loginCall.loading || sessionLoading.value,
  )

  const routeEmail = route.query.email
  if (!email.value && typeof routeEmail === 'string') {
    authFlow.setEmail(routeEmail)
  }

  const routeRedirect = getSafeInternalRedirect(route.query.redirect)
  if (routeRedirect) {
    authFlow.setPostAuthRedirect(routeRedirect)
  }

  async function login() {
    requestError.value = undefined

    const response = await loginCall.submit({
      email: email.value,
      password: password.value,
    })

    if (response?.ok && response.status === 'authenticated') {
      const session = await refreshSession()

      if (session?.authenticated) {
        const destination = resolvePostAuthDestination(
          authFlow.postAuthRedirect,
        )

        password.value = ''
        authFlow.reset()
        void router.replace(destination)
        return
      }

      requestError.value = 'تعذر تأكيد الجلسة بعد تسجيل الدخول. حاول مرة أخرى.'
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
      requestError.value = 'هذا الحساب يتطلب خطوة تحقق إضافية قبل تسجيل الدخول.'
      return
    }

    requestError.value = 'تعذر إكمال تسجيل الدخول الآن. حاول مرة أخرى.'
  }

  function goToLogin() {
    void router.push(
      buildLoginLocation(authFlow.postAuthRedirect),
    )
  }

  function goToWelcome() {
    void router.push('/auth')
  }

  function goToRegister() {
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
