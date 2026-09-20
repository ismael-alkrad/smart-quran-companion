import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  useAuthMutation,
  type OnboardingFocus,
  type OnboardingPace,
} from '@/modules/auth/api'

export function useFirstTimeSetup() {
  const router = useRouter()
  const completeCall = useAuthMutation('completeOnboarding')

  const focus = ref<OnboardingFocus>('both')
  const pace = ref<OnboardingPace>('balanced')
  const requestError = ref<string>()

  const loading = computed(() => completeCall.loading)

  async function completeSetup() {
    requestError.value = undefined

    const response = await completeCall.submit({
      focus: focus.value,
      pace: pace.value,
    })

    if (response?.ok && response.status === 'completed') {
      void router.replace('/auth/startup')
      return
    }

    requestError.value =
      'تعذر حفظ إعداد البداية الآن. حاول مرة أخرى.'
  }

  function goBack() {
    void router.push('/auth/account-ready')
  }

  return {
    focus,
    pace,
    requestError,
    loading,
    completeSetup,
    goBack,
  }
}
