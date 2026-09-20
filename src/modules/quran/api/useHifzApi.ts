import { useSmartQuranCall } from '@/shared/api'
import type {
  HifzOverviewResponse,
  HifzSurahProgressParams,
  HifzSurahProgressResponse,
} from '@/modules/quran/api/contracts'

const HIFZ_QUERY_METHODS = {
  overview: 'hifz.get_overview',
  surahProgress: 'hifz.get_surah_progress',
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


export function useHifzSurahProgressQuery(surahNumber: number) {
  return useSmartQuranCall<
    HifzSurahProgressResponse,
    HifzSurahProgressParams
  >(HIFZ_QUERY_METHODS.surahProgress, {
    method: 'GET',
    immediate: false,
    params: {
      surah_number: surahNumber,
    },
  })
}
