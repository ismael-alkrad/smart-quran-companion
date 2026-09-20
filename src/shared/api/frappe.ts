import {
  FrappeResponseError,
  useCall,
  type BasicParams,
  type UseCallOptions,
} from 'frappe-ui'

export const SMART_QURAN_API_PREFIX = '/api/v2/method/smart_quran.api'

type SmartQuranWindow = Window & {
  csrf_token?: string
}

type CsrfSessionEnvelope = {
  data?: {
    csrf_token?: unknown
  }
}

let csrfBootstrapPromise: Promise<void> | null = null

export function smartQuranApiUrl(method: string) {
  const normalizedMethod = method.trim().replace(/^\.+|\.+$/g, '')

  if (!normalizedMethod) {
    throw new Error('Smart Quran API method cannot be empty.')
  }

  return `${SMART_QURAN_API_PREFIX}.${normalizedMethod}`
}

function getBrowserCsrfToken() {
  if (typeof window === 'undefined') {
    return undefined
  }

  const token = (window as SmartQuranWindow).csrf_token

  if (!token || token === '{{ csrf_token }}') {
    return undefined
  }

  return token
}

export function setBrowserCsrfToken(token?: string) {
  if (typeof window === 'undefined') {
    return
  }

  const frappeWindow = window as SmartQuranWindow

  if (token) {
    frappeWindow.csrf_token = token
    return
  }

  delete frappeWindow.csrf_token
}

async function bootstrapBrowserCsrfToken() {
  if (typeof window === 'undefined' || getBrowserCsrfToken()) {
    return
  }

  if (!csrfBootstrapPromise) {
    csrfBootstrapPromise = (async () => {
      const response = await fetch(
        smartQuranApiUrl('auth.session_status'),
        {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
            'X-Frappe-Site-Name': window.location.hostname,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Unable to initialize the Frappe CSRF session.')
      }

      const payload = await response.json() as CsrfSessionEnvelope
      const token = payload.data?.csrf_token

      if (typeof token !== 'string' || !token) {
        throw new Error('Frappe did not return a CSRF token.')
      }

      setBrowserCsrfToken(token)
    })().finally(() => {
      csrfBootstrapPromise = null
    })
  }

  await csrfBootstrapPromise
}

export type SmartQuranCallOptions<
  TResponse,
  TParams extends BasicParams = undefined,
> = Omit<UseCallOptions<TResponse, TParams>, 'url'>

export function useSmartQuranCall<
  TResponse,
  TParams extends BasicParams = undefined,
>(
  method: string,
  options?: SmartQuranCallOptions<TResponse, TParams>,
) {
  const requestMethod = options?.method ?? 'GET'
  const callerBeforeSubmit = options?.beforeSubmit

  return useCall<TResponse, TParams>({
    ...(options ?? {}),
    url: smartQuranApiUrl(method),
    beforeSubmit:
      requestMethod === 'GET' && !callerBeforeSubmit
        ? undefined
        : async (params?: TParams) => {
            if (requestMethod !== 'GET') {
              await bootstrapBrowserCsrfToken()
            }

            await callerBeforeSubmit?.(params)
          },
  })
}

export { FrappeResponseError }
