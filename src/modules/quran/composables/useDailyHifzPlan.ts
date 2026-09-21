import { computed, ref } from 'vue'

import {
  type HifzDailyPlanResponse,
  type HifzStatus,
  useHifzDailyPlanQuery,
} from '@/modules/quran/api'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { getQuranSurahMetadataByNumber } from '@/modules/quran/repositories/quran.repository'
import type { QuranSurahMetadata } from '@/modules/quran/types/mushaf'
import { COMPLETED_HIFZ_STATUSES } from '@/modules/quran/utils/hifz'

export function useDailyHifzPlan() {
  const query = useHifzDailyPlanQuery()

  const loading = ref(false)
  const failed = ref(false)
  const plan = ref<HifzDailyPlanResponse | null>(null)
  const metadata = ref<QuranSurahMetadata | null>(null)

  async function refresh() {
    loading.value = true
    failed.value = false

    try {
      const response = await query.fetch()

      if (!response?.ok) {
        plan.value = null
        metadata.value = null
        failed.value = true
        return null
      }

      plan.value = response

      if (!response.assignment) {
        metadata.value = null
        return response
      }

      metadata.value = await getQuranSurahMetadataByNumber(
        response.assignment.surah_number,
      )

      return response
    } catch {
      plan.value = null
      metadata.value = null
      failed.value = true
      return null
    } finally {
      loading.value = false
    }
  }

  const surahName = computed(() => {
    const surahNumber = plan.value?.assignment?.surah_number

    if (!surahNumber) return ''

    return getSurahNameArabic(surahNumber)
  })

  const completedAssignmentAyahs = computed(() => {
    const assignment = plan.value?.assignment
    const progress = plan.value?.progress

    if (!assignment || !progress) return 0

    if (plan.value?.task_state === 'done') {
      return assignment.total_ayahs
    }

    return progress.ayahs.filter((ayah) =>
      ayah.ayah_number >= assignment.start_ayah
      && ayah.ayah_number <= assignment.end_ayah
      && COMPLETED_HIFZ_STATUSES.has(ayah.status),
    ).length
  })

  const progressValue = computed(() => {
    const assignment = plan.value?.assignment

    if (!assignment || assignment.total_ayahs <= 0) return 0

    return (
      completedAssignmentAyahs.value
      / assignment.total_ayahs
    ) * 100
  })


  const assignmentStatus = computed<HifzStatus>(() => {
    const assignment = plan.value?.assignment
    const progress = plan.value?.progress

    if (!assignment || !progress) {
      return 'initial_hifz'
    }

    const statuses = progress.ayahs
      .filter((ayah) =>
        ayah.ayah_number >= assignment.start_ayah
        && ayah.ayah_number <= assignment.end_ayah,
      )
      .map(ayah => ayah.status)

    if (!statuses.length) {
      return 'initial_hifz'
    }

    if (statuses.includes('needs_review')) {
      return 'needs_review'
    }

    if (statuses.includes('pending_tasmee')) {
      return 'pending_tasmee'
    }

    if (statuses.includes('memorizing')) {
      return 'memorizing'
    }

    if (statuses.includes('pending_approval')) {
      return 'pending_approval'
    }

    if (statuses.every(status => status === 'mastered')) {
      return 'mastered'
    }

    if (
      statuses.every(
        status => status === 'approved' || status === 'mastered',
      )
    ) {
      return 'approved'
    }

    return 'initial_hifz'
  })

  return {
    plan,
    metadata,
    surahName,
    completedAssignmentAyahs,
    progressValue,
    assignmentStatus,
    loading,
    failed,
    refresh,
  }
}
