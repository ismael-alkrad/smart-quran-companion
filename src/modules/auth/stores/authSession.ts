import { defineStore } from 'pinia'
import { ref } from 'vue'

import type {
  AuthSessionStatusResponse,
  AuthSessionUser,
} from '@/modules/auth/api'
import { setBrowserCsrfToken } from '@/shared/api'

export const useAuthSessionStore = defineStore('auth-session', () => {
  const authenticated = ref<boolean | null>(null)
  const user = ref<AuthSessionUser | null>(null)

  function applyStatus(status: AuthSessionStatusResponse) {
    authenticated.value = status.authenticated
    user.value = status.authenticated ? status.user : null
    setBrowserCsrfToken(status.csrf_token)
  }

  function clear() {
    authenticated.value = false
    user.value = null
    setBrowserCsrfToken()
  }

  return {
    authenticated,
    user,
    applyStatus,
    clear,
  }
})
