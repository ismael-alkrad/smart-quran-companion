import { useSmartQuranCall } from '@/shared/api'
import type { HomeSummaryResponse } from '@/modules/home/api/contracts'

const HOME_QUERY_METHODS = {
  summary: 'home.get_summary',
} as const

export function useHomeSummaryQuery() {
  return useSmartQuranCall<HomeSummaryResponse>(
    HOME_QUERY_METHODS.summary,
    {
      method: 'GET',
      immediate: false,
    },
  )
}
