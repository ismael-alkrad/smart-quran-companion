import type { MushafPage } from '@/modules/quran/types/mushaf'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

interface FrappeV2Response<T> { data: T }

export async function getMushafPage(pageNumber: number, signal?: AbortSignal): Promise<MushafPage> {
  const origin = apiBaseUrl || window.location.origin
  const endpoint = new URL('/api/v2/method/smart_quran.api.quran.get_page', origin)
  endpoint.searchParams.set('page_number', String(pageNumber))

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = payload?.exception ?? payload?.message ??
      `Unable to load Mushaf page ${pageNumber} (HTTP ${response.status})`
    throw new Error(message)
  }

  const payload = (await response.json()) as FrappeV2Response<MushafPage> | MushafPage
  return 'data' in payload ? payload.data : payload
}
