import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { getMushafPage } from '@/modules/quran/repositories/quran.repository'
import { loadQcfV2PageFont } from '@/modules/quran/services/qcfFont.service'

export function useMushafPage(pageNumber: MaybeRefOrGetter<number>) {
  const normalizedPage = computed(() =>
    Math.min(604, Math.max(1, Number(toValue(pageNumber)) || 1)),
  )

  return useQuery({
    queryKey: computed(() => ['local-mushaf-page', normalizedPage.value]),
    queryFn: async ({ signal }) => {
      const page = await getMushafPage(normalizedPage.value, signal)
      await loadQcfV2PageFont(page.pageNumber)
      return page
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })
}
