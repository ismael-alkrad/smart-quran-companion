<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
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

type ReaderDirection = 'next' | 'previous'

const route = useRoute()
const router = useRouter()

const controlsVisible = ref(true)
const savedPosition = ref<QuranReadingPosition | null>(null)
const positionLoaded = ref(false)
const isSpreadViewport = ref(false)
const isTurning = ref(false)

const mobileViewport = ref<HTMLElement | null>(null)
const mobileDragX = ref(0)
const mobileTransitioning = ref(false)
const pointerStartX = ref(0)
const pointerStartY = ref(0)
const pointerStartedAt = ref(0)
const activePointerId = ref<number | null>(null)
const draggingHorizontally = ref(false)
const suppressNextClick = ref(false)

const spreadRightPane = ref<HTMLElement | null>(null)
const spreadLeftPane = ref<HTMLElement | null>(null)

const readingPositionCall = useQuranReadingPositionQuery()
const savePositionCall = useSaveQuranReadingPositionMutation()

let spreadMedia: MediaQueryList | null = null
let suppressClickTimer = 0

const pageNumber = computed(() => {
  const value = Number(route.params.page)

  return Number.isFinite(value)
    ? Math.min(604, Math.max(1, Math.trunc(value)))
    : 1
})

const previousPageNumber = computed(() =>
  Math.max(1, pageNumber.value - 1),
)

const nextPageNumber = computed(() =>
  Math.min(604, pageNumber.value + 1),
)

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
const previousQuery = useMushafPage(previousPageNumber)
const nextQuery = useMushafPage(nextPageNumber)

const primaryPage = computed(() => primaryQuery.data.value ?? null)
const companionPage = computed(() => companionQuery.data.value ?? null)
const previousPage = computed(() => previousQuery.data.value ?? null)
const nextPage = computed(() => nextQuery.data.value ?? null)

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

const loading = computed(() => primaryQuery.isPending.value)
const failed = computed(() => primaryQuery.isError.value)

const mobileTrackStyle = computed(() => ({
  transform: `translate3d(calc(-33.333333% + ${mobileDragX.value}px), 0, 0)`,
  transition: mobileTransitioning.value
    ? 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)'
    : 'none',
}))

function goBack() {
  void router.push('/quran')
}

function toggleControls() {
  controlsVisible.value = !controlsVisible.value
}

function readerTarget(direction: ReaderDirection) {
  const step = isSpreadViewport.value ? 2 : 1

  return direction === 'next'
    ? Math.min(604, pageNumber.value + step)
    : Math.max(1, pageNumber.value - step)
}

function canNavigate(direction: ReaderDirection) {
  const target = readerTarget(direction)
  return target !== pageNumber.value
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function animateMobileTurn(direction: ReaderDirection) {
  if (
    isTurning.value
    || !canNavigate(direction)
    || !mobileViewport.value
  ) {
    mobileTransitioning.value = true
    mobileDragX.value = 0
    await delay(220)
    mobileTransitioning.value = false
    return
  }

  isTurning.value = true
  mobileTransitioning.value = true

  const distance = mobileViewport.value.clientWidth

  mobileDragX.value = direction === 'next'
    ? distance
    : -distance

  await delay(320)

  await router.push(`/quran/${readerTarget(direction)}`)
  await nextTick()

  mobileTransitioning.value = false
  mobileDragX.value = 0
  isTurning.value = false
}

async function animateSpreadTurn(direction: ReaderDirection) {
  if (isTurning.value || !canNavigate(direction)) return

  isTurning.value = true

  const turningPage = direction === 'next'
    ? spreadLeftPane.value
    : spreadRightPane.value

  let animation: Animation | null = null

  if (turningPage) {
    animation = turningPage.animate(
      [
        {
          transform: 'perspective(1800px) rotateY(0deg)',
          opacity: 1,
          filter: 'brightness(1)',
        },
        {
          offset: 0.55,
          transform: direction === 'next'
            ? 'perspective(1800px) rotateY(78deg)'
            : 'perspective(1800px) rotateY(-78deg)',
          opacity: 0.82,
          filter: 'brightness(0.88)',
        },
        {
          transform: direction === 'next'
            ? 'perspective(1800px) rotateY(156deg)'
            : 'perspective(1800px) rotateY(-156deg)',
          opacity: 0.18,
          filter: 'brightness(0.72)',
        },
      ],
      {
        duration: 520,
        easing: 'cubic-bezier(0.2, 0.72, 0.2, 1)',
        fill: 'forwards',
      },
    )

    turningPage.style.transformOrigin = direction === 'next'
      ? 'right center'
      : 'left center'

    try {
      await animation.finished
    } catch {
      // Navigation can safely continue if the animation is interrupted.
    }
  }

  await router.push(`/quran/${readerTarget(direction)}`)
  await nextTick()

  animation?.cancel()

  if (turningPage) {
    turningPage.style.transformOrigin = ''
  }

  isTurning.value = false
}

function navigateReader(direction: ReaderDirection) {
  if (isSpreadViewport.value) {
    void animateSpreadTurn(direction)
    return
  }

  void animateMobileTurn(direction)
}

function goPrevious() {
  navigateReader('previous')
}

function goNext() {
  navigateReader('next')
}

function clearSuppressClickTimer() {
  if (suppressClickTimer) {
    window.clearTimeout(suppressClickTimer)
    suppressClickTimer = 0
  }
}

function scheduleClickRelease() {
  clearSuppressClickTimer()

  suppressClickTimer = window.setTimeout(() => {
    suppressNextClick.value = false
    suppressClickTimer = 0
  }, 360)
}

function handleReaderClickCapture(event: MouseEvent) {
  if (!suppressNextClick.value) return

  event.preventDefault()
  event.stopPropagation()
}

function handlePointerDown(event: PointerEvent) {
  if (
    event.pointerType === 'mouse'
    || isTurning.value
  ) {
    return
  }

  activePointerId.value = event.pointerId
  pointerStartX.value = event.clientX
  pointerStartY.value = event.clientY
  pointerStartedAt.value = performance.now()
  draggingHorizontally.value = false
  mobileTransitioning.value = false

  mobileViewport.value?.setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return

  const dx = event.clientX - pointerStartX.value
  const dy = event.clientY - pointerStartY.value

  if (!draggingHorizontally.value) {
    if (Math.abs(dx) < 8) return

    if (Math.abs(dy) > Math.abs(dx)) {
      activePointerId.value = null
      mobileDragX.value = 0
      return
    }

    draggingHorizontally.value = true
    suppressNextClick.value = true
  }

  if (isSpreadViewport.value) {
    return
  }

  let resistedDx = dx

  if (dx > 0 && !canNavigate('next')) {
    resistedDx *= 0.22
  }

  if (dx < 0 && !canNavigate('previous')) {
    resistedDx *= 0.22
  }

  mobileDragX.value = resistedDx
}

function finishPointerGesture(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return

  const dx = event.clientX - pointerStartX.value
  const elapsed = Math.max(
    1,
    performance.now() - pointerStartedAt.value,
  )
  const velocity = Math.abs(dx) / elapsed

  activePointerId.value = null

  if (!draggingHorizontally.value) {
    mobileDragX.value = 0
    return
  }

  draggingHorizontally.value = false
  scheduleClickRelease()

  const threshold = isSpreadViewport.value
    ? 56
    : Math.min(
        88,
        (mobileViewport.value?.clientWidth ?? window.innerWidth) * 0.18,
      )

  const shouldTurn =
    Math.abs(dx) >= threshold
    || velocity >= 0.42

  if (!shouldTurn) {
    if (!isSpreadViewport.value) {
      mobileTransitioning.value = true
      mobileDragX.value = 0

      window.setTimeout(() => {
        mobileTransitioning.value = false
      }, 220)
    }

    return
  }

  const direction: ReaderDirection = dx > 0
    ? 'next'
    : 'previous'

  navigateReader(direction)
}

function handlePointerCancel(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return

  activePointerId.value = null
  draggingHorizontally.value = false
  mobileTransitioning.value = true
  mobileDragX.value = 0

  window.setTimeout(() => {
    mobileTransitioning.value = false
  }, 220)
}

function updateSpreadViewport(matches: boolean) {
  isSpreadViewport.value = matches
  mobileDragX.value = 0
  mobileTransitioning.value = false
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
  spreadMedia = window.matchMedia(
    '(min-width: 768px) and (orientation: landscape)',
  )

  updateSpreadViewport(spreadMedia.matches)

  spreadMedia.addEventListener('change', (event) => {
    updateSpreadViewport(event.matches)
  })

  try {
    const response = await readingPositionCall.fetch()
    savedPosition.value = response?.position ?? null
  } catch {
    savedPosition.value = null
  } finally {
    positionLoaded.value = true
  }
})

onBeforeUnmount(() => {
  clearSuppressClickTimer()
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
        v-if="!isSpreadViewport"
        ref="mobileViewport"
        class="relative mx-auto min-h-dvh w-full touch-pan-y overflow-hidden"
        aria-label="صفحة المصحف"
        @click.capture="handleReaderClickCapture"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="finishPointerGesture"
        @pointercancel="handlePointerCancel"
      >
        <div
          class="flex w-[300%] flex-row-reverse items-start will-change-transform"
          :style="mobileTrackStyle"
        >
          <div class="w-1/3 shrink-0">
            <QuranMushafPane
              v-if="nextPage && pageNumber < 604"
              :page="nextPage"
              :saved-verse-key="
                savedPosition?.page_number === nextPage.pageNumber
                  ? savedVerseKey
                  : null
              "
              @select-ayah="selectAyah"
              @toggle-controls="toggleControls"
            />
          </div>

          <div class="w-1/3 shrink-0">
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
          </div>

          <div class="w-1/3 shrink-0">
            <QuranMushafPane
              v-if="previousPage && pageNumber > 1"
              :page="previousPage"
              :saved-verse-key="
                savedPosition?.page_number === previousPage.pageNumber
                  ? savedVerseKey
                  : null
              "
              @select-ayah="selectAyah"
              @toggle-controls="toggleControls"
            />
          </div>
        </div>
      </section>

      <section
        v-else
        dir="rtl"
        class="mx-auto grid min-h-dvh w-full max-w-[1180px] grid-cols-2 items-start gap-[2px] px-[16px] py-[16px] [perspective:1800px] lg:px-[24px]"
        aria-label="صفحتا المصحف"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="finishPointerGesture"
        @pointercancel="handlePointerCancel"
      >
        <div
          ref="spreadRightPane"
          class="min-w-0 [backface-visibility:hidden] [transform-style:preserve-3d]"
        >
          <QuranMushafPane
            v-if="tabletRightPage"
            spread
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
        </div>

        <div
          ref="spreadLeftPane"
          class="min-w-0 [backface-visibility:hidden] [transform-style:preserve-3d]"
        >
          <QuranMushafPane
            v-if="tabletLeftPage"
            spread
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
        </div>
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
            :disabled="!canNavigate('next')"
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
            :disabled="!canNavigate('previous')"
            @click="goPrevious"
          >
            السابق
          </button>
        </div>
      </div>
    </template>
  </main>
</template>
