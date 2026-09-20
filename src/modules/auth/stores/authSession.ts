import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AuthSessionStatusResponse,
  AuthSessionUser,
} from '@/modules/auth/api'

export const useAuthSessionStore = defineStore('auth-session', () => {
  const authenticated = ref<boolean | null>(null)
  const user = ref<AuthSessionUser | null>(null)

  function applyStatus(status: AuthSessionStatusResponse) {
    authenticated.value = status.authenticated
    user.value = status.authenticated ? status.user : null
  }

  function clear() {
    authenticated.value = false
    user.value = null
  }

  return {
    authenticated,
    user,
    applyStatus,
    clear,
  }
})
