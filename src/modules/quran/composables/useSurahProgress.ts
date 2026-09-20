import { computed, ref } from 'vue'

import {
  type HifzSurahProgress,
  useHifzSurahProgressQuery,
} from '@/modules/quran/api'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { getQuranSurahMetadataByNumber } from '@/modules/quran/repositories/quran.repository'
import type { QuranSurahMetadata } from '@/modules/quran/types/mushaf'
import { COMPLETED_HIFZ_STATUSES } from '@/modules/quran/utils/hifz'

export function useSurahProgress(surahNumber: number) {
  const query = useHifzSurahProgressQuery(surahNumber)

  const loading = ref(false)
  const failed = ref(false)
  const progress = ref<HifzSurahProgress | null>(null)
  const metadata = ref<QuranSurahMetadata | null>(null)

  async function refresh() {
    loading.value = true
    failed.value = false

    try {
      const [response, surahMetadata] = await Promise.all([
        query.fetch(),
        getQuranSurahMetadataByNumber(surahNumber),
      ])

      if (!response?.ok || response.surah_number !== surahNumber) {
        progress.value = null
        metadata.value = null
        failed.value = true
        return null
      }

      progress.value = response.progress
      metadata.value = surahMetadata
      return response
    } catch {
      progress.value = null
      metadata.value = null
      failed.value = true
      return null
    } finally {
      loading.value = false
    }
  }

  const surahName = computed(() =>
    getSurahNameArabic(surahNumber),
  )

  const completedAyahs = computed(() => {
    if (!metadata.value || !progress.value) return 0

    if (COMPLETED_HIFZ_STATUSES.has(progress.value.status)) {
      return metadata.value.ayahCount
    }

    return progress.value.ayahs.filter(ayah =>
      COMPLETED_HIFZ_STATUSES.has(ayah.status),
    ).length
  })

  const progressValue = computed(() => {
    if (!metadata.value || metadata.value.ayahCount <= 0) return 0

    return (
      completedAyahs.value
      / metadata.value.ayahCount
    ) * 100
  })

  const needsReview = computed(() =>
    progress.value?.status === 'needs_review'
    || progress.value?.ayahs.some(ayah => ayah.status === 'needs_review')
    || false,
  )

  return {
    progress,
    metadata,
    surahName,
    completedAyahs,
    progressValue,
    needsReview,
    loading,
    failed,
    refresh,
  }
}
