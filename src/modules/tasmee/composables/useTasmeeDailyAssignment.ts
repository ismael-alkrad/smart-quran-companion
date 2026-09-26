import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getSmartQuranMethod } from '@/shared/api'
import type { HifzDailyAssignment } from '@/modules/quran/api/contracts'
import {
  type HifzDailyPlanResponse,
  useEnsureHifzDailyAssignmentMutation,
} from '@/modules/quran/api'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { toArabicNumber } from '@/modules/quran/utils/number'

export function useTasmeeDailyAssignment() {
  const route = useRoute()
  const retryAssignment = ref<HifzDailyAssignment | null>(null)
  const planCall = useEnsureHifzDailyAssignmentMutation()
  const plan = ref<HifzDailyPlanResponse | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  const error = ref<unknown>(null)

  const assignment = computed(() =>
    retryAssignment.value ?? plan.value?.assignment ?? null,
  )

  const surahName = computed(() => {
    const surahNumber = assignment.value?.surah_number

    return surahNumber
      ? getSurahNameArabic(surahNumber)
      : ''
  })

  const rangeLabel = computed(() => {
    const current = assignment.value

    if (!current) return ''

    if (current.start_ayah === current.end_ayah) {
      return `الآية ${toArabicNumber(current.start_ayah)}`
    }

    return `الآيات ${toArabicNumber(current.start_ayah)}–${toArabicNumber(current.end_ayah)}`
  })

  const sessionMeta = computed(() => {
    if (!assignment.value || !surahName.value) return ''

    return `سورة ${surahName.value} · ${rangeLabel.value} · جلسة فردية`
  })

  async function refresh() {
    loading.value = true
    failed.value = false
    error.value = null

    try {
      if (typeof route.query.retry === 'string') {
        retryAssignment.value = await getSmartQuranMethod<HifzDailyAssignment>(
          'teacher_review.retry_assignment', { name: route.query.retry },
        )
        return null
      }
      const response = await planCall.submit()

      if (!response?.ok) {
        plan.value = null
        failed.value = true
        return null
      }

      plan.value = response
      return response
    } catch (cause) {
      plan.value = null
      failed.value = true
      error.value = cause
      return null
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return {
    plan,
    assignment,
    surahName,
    rangeLabel,
    sessionMeta,
    loading,
    failed,
    error,
    refresh,
  }
}
