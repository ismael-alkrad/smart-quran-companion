import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthMutation } from '@/modules/auth/api'
import { useAuthSession } from '@/modules/auth/composables/useAuthSession'
import {
  buildLoginErrorLocation,
  buildLoginLocation,
  resolvePostAuthDestination,
} from '@/modules/auth/navigation'
import { useAuthFlowStore } from '@/modules/auth/stores'

export function useLoginFlow() {
  const route = useRoute()
  const router = useRouter()
  const authFlow = useAuthFlowStore()
  const { email } = storeToRefs(authFlow)

  const password = ref('')
  const requestError = ref<string>()

  const loginCall = useAuthMutation('login')
  const { refreshSession } = useAuthSession()

  const loading = computed(() => loginCall.loading)

  const routeEmail = route.query.email
  if (!email.value && typeof routeEmail === 'string') {
    authFlow.setEmail(routeEmail)
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
        password.value = ''
        void router.replace(
          resolvePostAuthDestination(route.query.redirect),
        )
        return
      }

      requestError.value = 'تعذر تأكيد الجلسة بعد تسجيل الدخول. حاول مرة أخرى.'
      return
    }

    if (response?.status === 'invalid_credentials') {
      password.value = ''
      void router.replace(
        buildLoginErrorLocation(route.query.redirect),
      )
      return
    }

    requestError.value = 'تعذر تسجيل الدخول الآن. حاول مرة أخرى.'
  }

  function goToLogin() {
    void router.push(buildLoginLocation(route.query.redirect))
  }

  return {
    email,
    password,
    requestError,
    loading,
    login,
    goToLogin,
  }
}
