import { defineStore } from 'pinia'
import { ref } from 'vue'

const AUTH_FLOW_EMAIL_KEY = 'smart-quran.auth-flow.email'

function readStoredEmail() {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    return window.sessionStorage.getItem(AUTH_FLOW_EMAIL_KEY) ?? ''
  } catch {
    return ''
  }
}

function persistEmail(email: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (email) {
      window.sessionStorage.setItem(AUTH_FLOW_EMAIL_KEY, email)
    } else {
      window.sessionStorage.removeItem(AUTH_FLOW_EMAIL_KEY)
    }
  } catch {
    // Auth flow still works in-memory when sessionStorage is unavailable.
  }
}

export const useAuthFlowStore = defineStore('auth-flow', () => {
  const email = ref(readStoredEmail())
  const verificationCode = ref('')

  function setEmail(value: string) {
    const normalized = value.trim().toLowerCase()
    email.value = normalized
    persistEmail(normalized)
  }

  function clearVerificationCode() {
    verificationCode.value = ''
  }

  function reset() {
    email.value = ''
    verificationCode.value = ''
    persistEmail('')
  }

  return {
    email,
    verificationCode,
    setEmail,
    clearVerificationCode,
    reset,
  }
})
