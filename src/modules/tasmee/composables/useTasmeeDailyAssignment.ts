import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import {
  type HifzDailyPlanResponse,
  useHifzDailyPlanQuery,
} from '@/modules/quran/api'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { toArabicNumber } from '@/modules/quran/utils/number'

function queryValue(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : null
  }

  return typeof value === 'string' ? value : null
}

export function useTasmeeDailyAssignment() {
  const route = useRoute()
  const planCall = useHifzDailyPlanQuery()
  const plan = ref<HifzDailyPlanResponse | null>(null)

  const requestedAssignmentName = computed(() =>
    queryValue(route.query.assignment),
  )

  const assignment = computed(() => {
    const requestedName = requestedAssignmentName.value
    const currentAssignment = plan.value?.assignment

    if (
      !requestedName
      || !currentAssignment
      || currentAssignment.name !== requestedName
    ) {
      return null
    }

    return currentAssignment
  })

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

  const loading = computed(() => planCall.isPending.value)
  const failed = computed(() =>
    planCall.isError.value
    || (!loading.value && plan.value !== null && !assignment.value),
  )

  async function refresh() {
    const response = await planCall.fetch()
    plan.value = response ?? null
    return response
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
    error: planCall.error,
    refresh,
  }
}
