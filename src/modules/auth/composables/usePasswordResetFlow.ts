import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthMutation } from '@/modules/auth/api'
import { buildLoginLocation } from '@/modules/auth/navigation'
import { useAuthFlowStore } from '@/modules/auth/stores'

const FORGOT_PASSWORD_ROUTE = '/auth/forgot-password'
const RESET_PASSWORD_ROUTE = '/auth/reset-password'
const RESET_SUCCESS_ROUTE = '/auth/password-reset-success'

export function usePasswordResetFlow() {
  const router = useRouter()
  const authFlow = useAuthFlowStore()
  const { passwordResetCode } = storeToRefs(authFlow)

  const email = computed({
    get: () => authFlow.email,
    set: (value: string) => authFlow.setEmail(value),
  })

  const password = ref('')
  const confirmation = ref('')
  const requestError = ref<string>()
  const codeError = ref<string>()
  const confirmationError = ref<string>()

  const requestCall = useAuthMutation('requestPasswordReset')
  const resetCall = useAuthMutation('resetPassword')

  const requesting = computed(() => requestCall.loading)
  const resetting = computed(() => resetCall.loading)

  function clearErrors() {
    requestError.value = undefined
    codeError.value = undefined
    confirmationError.value = undefined
  }

  function ensureEmail() {
    if (email.value) {
      return true
    }

    void router.replace(FORGOT_PASSWORD_ROUTE)
    return false
  }

  async function requestResetCode() {
    clearErrors()

    const response = await requestCall.submit({
      email: email.value,
    })

    if (response?.ok && response.status === 'sent') {
      authFlow.clearPasswordResetCode()
      password.value = ''
      confirmation.value = ''
      void router.push(RESET_PASSWORD_ROUTE)
      return
    }

    requestError.value = 'تعذر إرسال رمز الاستعادة الآن. حاول مرة أخرى.'
  }

  async function resetPassword() {
    if (!ensureEmail()) {
      return
    }

    clearErrors()

    if (password.value !== confirmation.value) {
      confirmationError.value = 'كلمتا المرور غير متطابقتين'
      return
    }

    const response = await resetCall.submit({
      email: email.value,
      code: passwordResetCode.value,
      password: password.value,
    })

    if (response?.ok && response.status === 'password_updated') {
      authFlow.clearPasswordResetCode()
      password.value = ''
      confirmation.value = ''
      void router.replace(RESET_SUCCESS_ROUTE)
      return
    }

    if (response?.status === 'invalid_or_expired_code') {
      codeError.value = 'رمز الاستعادة غير صحيح أو منتهي'
      return
    }

    requestError.value = 'تعذر تحديث كلمة المرور الآن. حاول مرة أخرى.'
  }

  function goToLogin() {
    void router.push(buildLoginLocation(undefined))
  }

  function goToForgotPassword() {
    void router.push(FORGOT_PASSWORD_ROUTE)
  }

  return {
    email,
    passwordResetCode,
    password,
    confirmation,
    requestError,
    codeError,
    confirmationError,
    requesting,
    resetting,
    requestResetCode,
    resetPassword,
    goToLogin,
    goToForgotPassword,
  }
}
