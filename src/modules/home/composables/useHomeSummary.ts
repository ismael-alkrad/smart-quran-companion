import { computed, ref } from 'vue'

import {
  useHomeSummaryQuery,
  type HomeSummaryResponse,
} from '@/modules/home/api'

export function useHomeSummary() {
  const query = useHomeSummaryQuery()
  const summary = ref<HomeSummaryResponse | null>(null)
  const failed = ref(false)

  const loading = computed(() => query.loading)

  async function refresh() {
    failed.value = false

    try {
      const response = await query.fetch()

      if (!response?.ok || response.status !== 'ready') {
        summary.value = null
        failed.value = true
        return null
      }

      summary.value = response
      return response
    } catch {
      summary.value = null
      failed.value = true
      return null
    }
  }

  return {
    summary,
    loading,
    failed,
    refresh,
  }
}
