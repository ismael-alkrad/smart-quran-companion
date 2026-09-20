export type {
  HifzAyahProgress,
  HifzDailyAssignment,
  HifzDailyPlanResponse,
  HifzDailyTaskState,
  HifzOverviewResponse,
  HifzStatus,
  HifzStrength,
  HifzSurahProgress,
  HifzSurahProgressParams,
  HifzSurahProgressResponse,
} from '@/modules/quran/api/contracts'
export {
  useHifzDailyPlanQuery,
  useHifzOverviewQuery,
  useHifzSurahProgressQuery,
} from '@/modules/quran/api/useHifzApi'
