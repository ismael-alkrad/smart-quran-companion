import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AuthSessionStatusResponse,
  AuthSessionUser,
} from '@/modules/auth/api'

type FrappeWindow = Window & {
  csrf_token?: string
}

function setBrowserCsrfToken(token?: string) {
  if (typeof window === 'undefined') {
    return
  }

  const frappeWindow = window as FrappeWindow

  if (token) {
    frappeWindow.csrf_token = token
  } else {
    delete frappeWindow.csrf_token
  }
}

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
