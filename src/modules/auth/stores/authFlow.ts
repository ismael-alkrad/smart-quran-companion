import { defineStore } from 'pinia'
import { ref } from 'vue'

const AUTH_FLOW_EMAIL_KEY = 'smart-quran.auth-flow.email'
const AUTH_FLOW_REDIRECT_KEY = 'smart-quran.auth-flow.redirect'

function readSessionValue(key: string) {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    return window.sessionStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function persistSessionValue(key: string, value: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (value) {
      window.sessionStorage.setItem(key, value)
    } else {
      window.sessionStorage.removeItem(key)
    }
  } catch {
    // Auth flow still works in-memory when sessionStorage is unavailable.
  }
}

export const useAuthFlowStore = defineStore('auth-flow', () => {
  const email = ref(readSessionValue(AUTH_FLOW_EMAIL_KEY))
  const postAuthRedirect = ref(readSessionValue(AUTH_FLOW_REDIRECT_KEY))
  const verificationCode = ref('')
  const passwordResetCode = ref('')

  function setEmail(value: string) {
    const normalized = value.trim().toLowerCase()
    email.value = normalized
    persistSessionValue(AUTH_FLOW_EMAIL_KEY, normalized)
  }

  function setPostAuthRedirect(value?: string) {
    const normalized = value?.trim() ?? ''
    postAuthRedirect.value = normalized
    persistSessionValue(AUTH_FLOW_REDIRECT_KEY, normalized)
  }

  function clearVerificationCode() {
    verificationCode.value = ''
  }

  function clearPasswordResetCode() {
    passwordResetCode.value = ''
  }

  function reset() {
    email.value = ''
    postAuthRedirect.value = ''
    verificationCode.value = ''
    passwordResetCode.value = ''
    persistSessionValue(AUTH_FLOW_EMAIL_KEY, '')
    persistSessionValue(AUTH_FLOW_REDIRECT_KEY, '')
  }

  return {
    email,
    postAuthRedirect,
    verificationCode,
    passwordResetCode,
    setEmail,
    setPostAuthRedirect,
    clearVerificationCode,
    clearPasswordResetCode,
    reset,
  }
})
