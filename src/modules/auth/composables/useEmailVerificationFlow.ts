import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthMutation } from '@/modules/auth/api'
import { useAuthFlowStore } from '@/modules/auth/stores'

const VERIFY_EMAIL_ROUTE = '/auth/verify-email'
const VERIFICATION_ERROR_ROUTE = '/auth/verification-error'
const CODE_RESENT_ROUTE = '/auth/code-resent'
const ACCOUNT_READY_ROUTE = '/auth/account-ready'
const REGISTER_ROUTE = '/auth/register'

export function useEmailVerificationFlow() {
  const router = useRouter()
  const authFlow = useAuthFlowStore()
  const { email, verificationCode } = storeToRefs(authFlow)

  const verifyCall = useAuthMutation('verifyEmail')
  const resendCall = useAuthMutation('resendVerificationCode')
  const requestError = ref<string>()

  const verifying = computed(() => verifyCall.loading)
  const resending = computed(() => resendCall.loading)

  function ensureEmail() {
    if (email.value) {
      return true
    }

    void router.replace(REGISTER_ROUTE)
    return false
  }

  async function verifyEmail() {
    if (!ensureEmail()) {
      return
    }

    requestError.value = undefined

    const response = await verifyCall.submit({
      email: email.value,
      code: verificationCode.value,
    })

    if (response?.ok && response.status === 'verified') {
      authFlow.clearVerificationCode()
      void router.push(ACCOUNT_READY_ROUTE)
      return
    }

    if (response?.status === 'invalid_or_expired_code') {
      void router.push(VERIFICATION_ERROR_ROUTE)
      return
    }

    requestError.value = 'تعذر التحقق من الرمز الآن. حاول مرة أخرى.'
  }

  async function resendVerificationCode() {
    if (!ensureEmail()) {
      return
    }

    requestError.value = undefined

    const response = await resendCall.submit({
      email: email.value,
    })

    if (response?.ok && response.status === 'sent') {
      authFlow.clearVerificationCode()
      void router.push(CODE_RESENT_ROUTE)
      return
    }

    requestError.value = 'تعذر إرسال رمز جديد الآن. حاول مرة أخرى.'
  }

  function returnToVerifyEmail() {
    void router.push(VERIFY_EMAIL_ROUTE)
  }

  return {
    email,
    verificationCode,
    requestError,
    verifying,
    resending,
    verifyEmail,
    resendVerificationCode,
    returnToVerifyEmail,
  }
}
