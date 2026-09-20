<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  type QuranReadingPosition,
  useQuranReadingPositionQuery,
  useSaveQuranReadingPositionMutation,
} from '@/modules/quran/api'
import QuranMushafPane from '@/modules/quran/components/QuranMushafPane.vue'
import { useMushafPage } from '@/modules/quran/composables/useMushafPage'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { toArabicNumber } from '@/modules/quran/utils/number'
import { BaseButton } from '@/shared/components'

const route = useRoute()
const router = useRouter()

const controlsVisible = ref(true)
const savedPosition = ref<QuranReadingPosition | null>(null)
const positionLoaded = ref(false)
const readingPositionCall = useQuranReadingPositionQuery()
const savePositionCall = useSaveQuranReadingPositionMutation()

const pageNumber = computed(() => {
  const value = Number(route.params.page)
  return Number.isFinite(value)
    ? Math.min(604, Math.max(1, Math.trunc(value)))
    : 1
})

const tabletLeftPageNumber = computed<number | null>(() => {
  const current = pageNumber.value

  if (current === 1) return null
  if (current === 604) return 604

  return current % 2 === 0
    ? current
    : current - 1
})

const tabletRightPageNumber = computed(() => {
  const current = pageNumber.value

  if (current === 1) return 1
  if (current === 604) return 603

  return current % 2 === 0
    ? current + 1
    : current
})

const companionPageNumber = computed(() => {
  const current = pageNumber.value

  if (current === 1) return 2
  if (current === 604) return 603

  return current % 2 === 0
    ? current + 1
    : current - 1
})

const primaryQuery = useMushafPage(pageNumber)
const companionQuery = useMushafPage(companionPageNumber)

const primaryPage = computed(() => primaryQuery.data.value ?? null)
const companionPage = computed(() => companionQuery.data.value ?? null)

const tabletLeftPage = computed(() => {
  const leftNumber = tabletLeftPageNumber.value

  if (leftNumber === null) return null

  if (primaryPage.value?.pageNumber === leftNumber) {
    return primaryPage.value
  }

  if (companionPage.value?.pageNumber === leftNumber) {
    return companionPage.value
  }

  return null
})

const tabletRightPage = computed(() => {
  const rightNumber = tabletRightPageNumber.value

  if (primaryPage.value?.pageNumber === rightNumber) {
    return primaryPage.value
  }

  if (companionPage.value?.pageNumber === rightNumber) {
    return companionPage.value
  }

  return null
})

const firstVerseAnchor = computed(() => {
  for (const line of primaryPage.value?.lines ?? []) {
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

const currentSurahName = computed(() => {
  const surahNumber = firstVerseAnchor.value?.surahNumber
    ?? primaryPage.value?.chapters[0]

  if (!surahNumber) return ''

  return getSurahNameArabic(surahNumber)
})

const juzNumber = computed(() => primaryPage.value?.juzNumber ?? null)

const savedVerseKey = computed(() => {
  const position = savedPosition.value

  if (!position) return null

  return `${position.surah_number}:${position.ayah_number}`
})

const savedPositionLabel = computed(() => {
  const position = savedPosition.value

  if (!position) return ''

  return `الآية ${toArabicNumber(position.ayah_number)} · الصفحة ${toArabicNumber(position.page_number)}`
})

const metadataLabel = computed(() => {
  const parts: string[] = []

  if (currentSurahName.value) {
    parts.push(`سورة ${currentSurahName.value}`)
  }

  if (juzNumber.value) {
    parts.push(`الجزء ${toArabicNumber(juzNumber.value)}`)
  }

  parts.push(`صفحة ${toArabicNumber(pageNumber.value)}`)

  return parts.join(' · ')
})

const loading = computed(
  () => primaryQuery.isPending.value || companionQuery.isPending.value,
)

const failed = computed(
  () => primaryQuery.isError.value,
)

function goBack() {
  void router.push('/quran')
}

function toggleControls() {
  controlsVisible.value = !controlsVisible.value
}

function navigationStep() {
  if (typeof window === 'undefined') return 1

  return window.matchMedia('(min-width: 768px)').matches
    ? 2
    : 1
}

function goPrevious() {
  const target = Math.max(1, pageNumber.value - navigationStep())

  if (target !== pageNumber.value) {
    void router.push(`/quran/${target}`)
  }
}

function goNext() {
  const target = Math.min(604, pageNumber.value + navigationStep())

  if (target !== pageNumber.value) {
    void router.push(`/quran/${target}`)
  }
}

async function savePosition(
  page: number,
  surahNumber: number,
  ayahNumber: number,
) {
  const response = await savePositionCall.submit({
    page_number: page,
    surah_number: surahNumber,
    ayah_number: ayahNumber,
  })

  if (response?.ok && response.status === 'saved') {
    savedPosition.value = response.position
  }
}

async function selectAyah(payload: {
  pageNumber: number
  surahNumber: number
  ayahNumber: number
}) {
  try {
    await savePosition(
      payload.pageNumber,
      payload.surahNumber,
      payload.ayahNumber,
    )
  } catch {
    // Keep the Mushaf usable if persistence temporarily fails.
  }
}

watch(
  () => [
    primaryPage.value?.pageNumber,
    positionLoaded.value,
  ] as const,
  async ([loadedPage, isPositionLoaded]) => {
    if (!loadedPage || !isPositionLoaded) return

    const existing = savedPosition.value

    if (existing?.page_number === loadedPage) {
      return
    }

    const anchor = firstVerseAnchor.value

    if (!anchor) return

    try {
      await savePosition(
        loadedPage,
        anchor.surahNumber,
        anchor.ayahNumber,
      )
    } catch {
      // Reading remains available offline even if backend persistence fails.
    }
  },
)

onMounted(async () => {
  try {
    const response = await readingPositionCall.fetch()
    savedPosition.value = response?.position ?? null
  } catch {
    savedPosition.value = null
  } finally {
    positionLoaded.value = true
  }
})
</script>

<template>
  <main
    dir="rtl"
    class="relative min-h-dvh w-full overflow-x-hidden bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      v-if="loading"
      class="grid min-h-dvh place-items-center px-[24px]"
    >
      <span
        dir="rtl"
        class="text-[14px] leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
      >
        جاري تجهيز المصحف…
      </span>
    </div>

    <div
      v-else-if="failed || !primaryPage"
      class="flex min-h-dvh items-center justify-center px-[24px]"
    >
      <div class="flex w-full max-w-[420px] flex-col items-start gap-[16px] text-right">
        <h1
          dir="rtl"
          class="w-full text-right text-[20px] font-semibold leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          المصحف المحلي غير جاهز
        </h1>

        <p
          dir="rtl"
          class="w-full text-right text-[14px] leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
        >
          {{
            primaryQuery.error.value instanceof Error
              ? primaryQuery.error.value.message
              : 'حدث خطأ غير متوقع.'
          }}
        </p>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          @click="primaryQuery.refetch()"
        >
          إعادة المحاولة
        </BaseButton>
      </div>
    </div>

    <template v-else>
      <section
        class="mx-auto w-full md:hidden"
        aria-label="صفحة المصحف"
      >
        <QuranMushafPane
          :page="primaryPage"
          :saved-verse-key="
            savedPosition?.page_number === primaryPage.pageNumber
              ? savedVerseKey
              : null
          "
          @select-ayah="selectAyah"
          @toggle-controls="toggleControls"
        />
      </section>

      <section
        dir="rtl"
        class="mx-auto hidden min-h-dvh w-full max-w-[1180px] grid-cols-2 items-start gap-[2px] px-[16px] py-[16px] md:grid lg:px-[24px]"
        aria-label="صفحتا المصحف"
      >
        <QuranMushafPane
          v-if="tabletRightPage"
          :page="tabletRightPage"
          :saved-verse-key="
            savedPosition?.page_number === tabletRightPage.pageNumber
              ? savedVerseKey
              : null
          "
          @select-ayah="selectAyah"
          @toggle-controls="toggleControls"
        />

        <div
          v-else
          aria-hidden="true"
          class="min-h-[90dvh]"
        />

        <QuranMushafPane
          v-if="tabletLeftPage"
          :page="tabletLeftPage"
          :saved-verse-key="
            savedPosition?.page_number === tabletLeftPage.pageNumber
              ? savedVerseKey
              : null
          "
          @select-ayah="selectAyah"
          @toggle-controls="toggleControls"
        />

        <div
          v-else
          aria-hidden="true"
          class="min-h-[90dvh]"
        />
      </section>

      <div
        class="pointer-events-none fixed inset-x-0 top-0 z-40 transition-opacity duration-200"
        :class="controlsVisible ? 'opacity-100' : 'opacity-0'"
      >
        <div
          class="pointer-events-auto mx-auto flex min-h-[72px] w-full max-w-[1180px] items-center justify-between gap-[12px] bg-[var(--sqc-color-background-elevated)]/95 px-[16px] pt-[max(12px,env(safe-area-inset-top))] pb-[12px] shadow-sm backdrop-blur md:mt-[12px] md:w-[calc(100%_-_32px)] md:rounded-[var(--sqc-dimension-radius-16)]"
        >
          <button
            type="button"
            class="flex size-[40px] shrink-0 items-center justify-center rounded-[var(--sqc-dimension-radius-999)] text-[20px] text-[color:var(--sqc-color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sqc-color-border-focus)]"
            aria-label="العودة"
            @click="goBack"
          >
            ›
          </button>

          <div class="flex min-w-0 flex-1 flex-col items-center gap-[2px] text-center">
            <strong
              dir="rtl"
              class="max-w-full truncate text-[14px] font-semibold leading-[24px] text-[color:var(--sqc-color-text-primary)]"
            >
              {{ metadataLabel }}
            </strong>

            <span
              v-if="savedPositionLabel"
              dir="rtl"
              class="max-w-full truncate text-[11px] font-medium leading-[16px] text-[color:var(--sqc-color-text-brand)]"
            >
              آخر موضع · {{ savedPositionLabel }}
            </span>
          </div>

          <div class="size-[40px] shrink-0" aria-hidden="true" />
        </div>
      </div>

      <div
        class="pointer-events-none fixed inset-x-0 bottom-0 z-40 transition-opacity duration-200"
        :class="controlsVisible ? 'opacity-100' : 'opacity-0'"
      >
        <div
          class="pointer-events-auto mx-auto mb-[max(12px,env(safe-area-inset-bottom))] flex h-[52px] w-[min(320px,calc(100%_-_32px))] items-center justify-between rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-background-elevated)]/95 px-[8px] shadow-lg backdrop-blur"
        >
          <button
            type="button"
            dir="rtl"
            class="h-[36px] rounded-[var(--sqc-dimension-radius-999)] px-[14px] text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-brand)] disabled:opacity-40"
            :disabled="pageNumber >= 604"
            @click="goNext"
          >
            التالي
          </button>

          <span
            dir="rtl"
            class="text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-secondary)]"
          >
            {{ toArabicNumber(pageNumber) }} / ٦٠٤
          </span>

          <button
            type="button"
            dir="rtl"
            class="h-[36px] rounded-[var(--sqc-dimension-radius-999)] px-[14px] text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-brand)] disabled:opacity-40"
            :disabled="pageNumber <= 1"
            @click="goPrevious"
          >
            السابق
          </button>
        </div>
      </div>
    </template>
  </main>
</template>
