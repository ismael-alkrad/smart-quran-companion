import { useSmartQuranCall } from '@/shared/api'
import type { HifzOverviewResponse } from '@/modules/quran/api/contracts'

const HIFZ_QUERY_METHODS = {
  overview: 'hifz.get_overview',
} as const

export function useHifzOverviewQuery() {
  return useSmartQuranCall<HifzOverviewResponse>(
    HIFZ_QUERY_METHODS.overview,
    {
      method: 'GET',
      immediate: false,
    },
  )
}
