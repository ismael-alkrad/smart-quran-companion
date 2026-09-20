import { computed, ref } from 'vue'

import {
  type HifzStatus,
  type HifzSurahProgress,
  useHifzOverviewQuery,
} from '@/modules/quran/api'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { getQuranSurahMetadata } from '@/modules/quran/repositories/quran.repository'
import type { QuranSurahMetadata } from '@/modules/quran/types/mushaf'
import type { QuranHifzDisplayStatus } from '@/modules/quran/components/QuranHifzStatusBadge.vue'

export type HifzOverviewFilter = 'all' | 'memorizing' | 'review'

export interface HifzOverviewSurah {
  surahNumber: number
  surahName: string
  ayahCount: number
  completedAyahs: number
  status: QuranHifzDisplayStatus
  progress: HifzSurahProgress | null
}

const COMPLETED_STATUSES = new Set<HifzStatus>(['approved', 'mastered'])
const ACTIVE_HIFZ_STATUSES = new Set<HifzStatus>([
  'initial_hifz',
  'memorizing',
  'pending_tasmee',
  'pending_approval',
])

function completedAyahs(
  metadata: QuranSurahMetadata,
  progress: HifzSurahProgress | null,
) {
  if (!progress) return 0

  if (COMPLETED_STATUSES.has(progress.status)) {
    return metadata.ayahCount
  }

  return progress.ayahs.filter(ayah =>
    COMPLETED_STATUSES.has(ayah.status),
  ).length
}

export function useHifzOverview() {
  const query = useHifzOverviewQuery()

  const loading = ref(false)
  const failed = ref(false)
  const surahs = ref<HifzOverviewSurah[]>([])
  const queryText = ref('')
  const filter = ref<HifzOverviewFilter>('all')

  async function refresh() {
    loading.value = true
    failed.value = false

    try {
      const [overview, metadataIndex] = await Promise.all([
        query.fetch(),
        getQuranSurahMetadata(),
      ])

      if (!overview?.ok || overview.status !== 'ready') {
        surahs.value = []
        failed.value = true
        return null
      }

      const progressBySurah = new Map(
        overview.items.map(item => [item.surah_number, item]),
      )

      surahs.value = metadataIndex.surahs
        .map((metadata) => {
          const progress = progressBySurah.get(metadata.surahNumber) ?? null

          return {
            surahNumber: metadata.surahNumber,
            surahName: getSurahNameArabic(metadata.surahNumber),
            ayahCount: metadata.ayahCount,
            completedAyahs: completedAyahs(metadata, progress),
            status: progress?.status ?? 'new',
            progress,
          } satisfies HifzOverviewSurah
        })
        .sort((left, right) => {
          const leftTracked = left.progress ? 0 : 1
          const rightTracked = right.progress ? 0 : 1

          if (leftTracked !== rightTracked) {
            return leftTracked - rightTracked
          }

          return left.surahNumber - right.surahNumber
        })

      return overview
    } catch {
      surahs.value = []
      failed.value = true
      return null
    } finally {
      loading.value = false
    }
  }

  const filteredSurahs = computed(() => {
    const normalizedQuery = queryText.value.trim()

    return surahs.value.filter((surah) => {
      if (
        normalizedQuery
        && !surah.surahName.includes(normalizedQuery)
        && !String(surah.surahNumber).includes(normalizedQuery)
      ) {
        return false
      }

      if (filter.value === 'memorizing') {
        return surah.progress
          ? ACTIVE_HIFZ_STATUSES.has(surah.progress.status)
          : false
      }

      if (filter.value === 'review') {
        return surah.status === 'needs_review'
      }

      return true
    })
  })

  const overallProgress = computed(() => {
    const totalAyahs = surahs.value.reduce(
      (total, surah) => total + surah.ayahCount,
      0,
    )
    const completed = surahs.value.reduce(
      (total, surah) => total + surah.completedAyahs,
      0,
    )

    if (totalAyahs <= 0) return 0

    return (completed / totalAyahs) * 100
  })

  const hasNeedsReview = computed(() =>
    surahs.value.some(surah => surah.status === 'needs_review'),
  )

  return {
    surahs,
    filteredSurahs,
    queryText,
    filter,
    overallProgress,
    hasNeedsReview,
    loading,
    failed,
    refresh,
  }
}
