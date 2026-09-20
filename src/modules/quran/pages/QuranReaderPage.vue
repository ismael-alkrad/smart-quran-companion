<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { HifzOverviewResponse } from '@/modules/quran/api'
import {
  useHifzOverviewQuery,
  useSaveQuranReadingPositionMutation,
} from '@/modules/quran/api'
import MushafPage from '@/modules/quran/components/MushafPage.vue'
import QuranHifzStatusBadge, {
  type QuranHifzDisplayStatus,
} from '@/modules/quran/components/QuranHifzStatusBadge.vue'
import { useMushafPage } from '@/modules/quran/composables/useMushafPage'
import {
  BaseAppBar,
  BaseBanner,
  BaseBottomNav,
  BaseButton,
  BaseSegmentedControl,
  type BaseBottomNavRoutes,
  type BaseSegmentedOption,
} from '@/shared/components'

const route = useRoute()
const router = useRouter()

const pageNumber = computed(() => {
  const value = Number(route.params.page)
  return Number.isFinite(value) ? Math.min(604, Math.max(1, value)) : 1
})

const { data: page, isPending, isError, error, refetch } = useMushafPage(pageNumber)

const hifzOverviewCall = useHifzOverviewQuery()
const savePositionCall = useSaveQuranReadingPositionMutation()

const hifzOverview = ref<HifzOverviewResponse | null>(null)
const lastSavedPositionKey = ref('')

const navRoutes: BaseBottomNavRoutes = {
  home: '/home',
  quran: '/quran',
}

const modeOptions: BaseSegmentedOption[] = [
  { value: 'reading', label: 'قراءة' },
  { value: 'hifz', label: 'حفظ' },
]

const firstVerseAnchor = computed(() => {
  for (const line of page.value?.lines ?? []) {
    const word = line.words[0]

    if (!word) continue

    const [surahText, ayahText] = word.verseKey.split(':')
    const surahNumber = Number(surahText)
    const ayahNumber = Number(ayahText)

    if (
      Number.isInteger(surahNumber)
      && Number.isInteger(ayahNumber)
    ) {
      return {
        surahNumber,
        ayahNumber,
      }
    }
  }

  return null
})

const hifzStatus = computed<QuranHifzDisplayStatus>(() => {
  const surahNumber = firstVerseAnchor.value?.surahNumber

  if (!surahNumber) return 'new'

  return (
    hifzOverview.value?.items.find(
      item => item.surah_number === surahNumber,
    )?.status ?? 'new'
  )
})

function goBack() {
  void router.push('/quran')
}

function updateMode(value: BaseSegmentedOption['value']) {
  if (value === 'hifz') {
    void router.push('/quran/hifz/daily-plan')
  }
}

watch(
  () => ({
    pageNumber: page.value?.pageNumber,
    anchor: firstVerseAnchor.value,
  }),
  async ({ pageNumber: currentPage, anchor }) => {
    if (!currentPage || !anchor) return

    const key = [
      currentPage,
      anchor.surahNumber,
      anchor.ayahNumber,
    ].join(':')

    if (lastSavedPositionKey.value === key) return

    lastSavedPositionKey.value = key

    try {
      await savePositionCall.submit({
        page_number: currentPage,
        surah_number: anchor.surahNumber,
        ayah_number: anchor.ayahNumber,
      })
    } catch {
      lastSavedPositionKey.value = ''
    }
  },
  {
    immediate: true,
    deep: true,
  },
)

onMounted(async () => {
  try {
    hifzOverview.value = await hifzOverviewCall.fetch() ?? null
  } catch {
    hifzOverview.value = null
  }
})
</script>

<template>
  <main
    dir="rtl"
    class="min-h-dvh min-w-[320px] overflow-x-clip bg-[var(--sqc-color-background-primary)] pb-[100px] pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      class="mx-auto flex w-full max-w-[720px] flex-col items-start gap-[16px] px-[16px] pt-[24px] sm:px-[24px]"
    >
      <BaseAppBar
        title="القراءة"
        type="back"
        @back="goBack"
      />

      <BaseSegmentedControl
        model-value="reading"
        :options="modeOptions"
        aria-label="وضع القرآن"
        @update:model-value="updateMode"
      />

      <p
        dir="rtl"
        class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
      >
        حفص عن عاصم
      </p>

      <QuranHifzStatusBadge
        v-if="hifzStatus !== 'new'"
        :status="hifzStatus"
      />

      <h2
        dir="rtl"
        class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
      >
        موضع القراءة
      </h2>
    </div>

    <div
      v-if="isPending"
      class="grid min-h-[60dvh] place-items-center content-center gap-[10px] p-[32px] text-center text-[color:var(--sqc-color-text-secondary)]"
      role="status"
    >
      جاري تجهيز صفحة المصحف…
    </div>

    <div
      v-else-if="isError"
      class="mx-auto flex min-h-[60dvh] w-full max-w-[480px] flex-col items-center justify-center gap-[12px] px-[24px] text-center"
      role="alert"
    >
      <strong
        class="text-[18px] font-semibold leading-[28px] text-[color:var(--sqc-color-text-primary)]"
      >
        المصحف المحلي غير جاهز
      </strong>

      <p
        dir="rtl"
        class="m-0 text-[14px] leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
      >
        {{ error instanceof Error ? error.message : 'حدث خطأ غير متوقع.' }}
      </p>

      <BaseButton
        size="large"
        variant="primary"
        @click="refetch()"
      >
        إعادة المحاولة
      </BaseButton>
    </div>

    <div
      v-else-if="page"
      class="mx-auto mt-[16px] w-full max-w-[560px] px-[8px]"
    >
      <MushafPage :page="page" />
    </div>

    <div class="mx-auto mt-[16px] w-full max-w-[720px] px-[16px] sm:px-[24px]">
      <BaseBanner
        title="الحفظ منفصل عن التجويد"
        body="ألوان الحالات هنا تعبّر عن حالة الحفظ والمراجعة فقط، وليست حكمًا على التجويد."
        tone="info"
        class="!w-full"
      />
    </div>

    <div class="fixed inset-x-0 bottom-0 z-50">
      <BaseBottomNav
        model-value="quran"
        :routes="navRoutes"
        class="!static"
      />
    </div>
  </main>
</template>
