import {
  FrappeResponseError,
  useCall,
  type BasicParams,
  type UseCallOptions,
} from 'frappe-ui'

export const SMART_QURAN_API_PREFIX = '/api/v2/method/smart_quran.api'

export function smartQuranApiUrl(method: string) {
  const normalizedMethod = method.trim().replace(/^\.+|\.+$/g, '')

  if (!normalizedMethod) {
    throw new Error('Smart Quran API method cannot be empty.')
  }

  return `${SMART_QURAN_API_PREFIX}.${normalizedMethod}`
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
  return useCall<TResponse, TParams>({
    ...(options ?? {}),
    url: smartQuranApiUrl(method),
  })
}

export { FrappeResponseError }
