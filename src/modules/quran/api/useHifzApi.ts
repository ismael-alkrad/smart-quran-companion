import { useSmartQuranCall } from '@/shared/api'
import type {
  HifzDailyPlanResponse,
  HifzDailyTransitionParams,
  HifzDailyTransitionResponse,
  HifzOverviewResponse,
  HifzSurahProgressParams,
  HifzSurahProgressResponse,
} from '@/modules/quran/api/contracts'

const HIFZ_QUERY_METHODS = {
  overview: 'hifz.get_overview',
  surahProgress: 'hifz.get_surah_progress',
  dailyPlan: 'hifz.get_daily_plan',
} as const

const HIFZ_MUTATION_METHODS = {
  ensureDailyAssignment: 'hifz.ensure_daily_assignment',
  startDailyHifz: 'hifz.start_daily_hifz',
  readyForTasmee: 'hifz.mark_daily_hifz_ready_for_tasmee',
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


export function useHifzDailyPlanQuery() {
  return useSmartQuranCall<HifzDailyPlanResponse>(
    HIFZ_QUERY_METHODS.dailyPlan,
    {
      method: 'GET',
      immediate: false,
    },
  )
}


export function useEnsureHifzDailyAssignmentMutation() {
  return useSmartQuranCall<HifzDailyPlanResponse>(
    HIFZ_MUTATION_METHODS.ensureDailyAssignment,
    {
      method: 'POST',
      immediate: false,
    },
  )
}


export function useStartHifzDailyAssignmentMutation() {
  return useSmartQuranCall<
    HifzDailyTransitionResponse,
    HifzDailyTransitionParams
  >(HIFZ_MUTATION_METHODS.startDailyHifz, {
    method: 'POST',
    immediate: false,
  })
}


export function useMarkHifzDailyReadyForTasmeeMutation() {
  return useSmartQuranCall<
    HifzDailyTransitionResponse,
    HifzDailyTransitionParams
  >(HIFZ_MUTATION_METHODS.readyForTasmee, {
    method: 'POST',
    immediate: false,
  })
}
