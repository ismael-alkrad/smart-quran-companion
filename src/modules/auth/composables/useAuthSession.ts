import { computed } from 'vue'
import { useAuthMutation, useAuthSessionStatus } from '@/modules/auth/api'
import { useAuthSessionStore } from '@/modules/auth/stores'

export function useAuthSession() {
  const sessionStore = useAuthSessionStore()
  const sessionStatusCall = useAuthSessionStatus()
  const logoutCall = useAuthMutation('logout')

  const loading = computed(
    () => sessionStatusCall.loading || logoutCall.loading,
  )

  async function refreshSession() {
    const response = await sessionStatusCall.fetch()

    if (response) {
      sessionStore.applyStatus(response)
    }

    return response
  }

  async function logout() {
    const response = await logoutCall.submit({})

    if (response?.ok && response.status === 'logged_out') {
      sessionStore.clear()
    }

    return response
  }

  return {
    sessionStore,
    loading,
    refreshSession,
    logout,
  }
}
