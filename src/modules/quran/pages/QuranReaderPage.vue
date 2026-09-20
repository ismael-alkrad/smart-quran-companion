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
import type { MushafPage } from '@/modules/quran/types/mushaf'
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

const spreadTurnDirection = ref<ReaderDirection | null>(null)
const spreadTurnProgress = ref(0)
const spreadSettling = ref(false)

const readingPositionCall = useQuranReadingPositionQuery()
const savePositionCall = useSaveQuranReadingPositionMutation()

let spreadMedia: MediaQueryList | null = null
let suppressClickTimer = 0

function clampPage(value: number) {
  return Math.min(604, Math.max(1, Math.trunc(value)))
}

function spreadLeftPageNumber(anchor: number): number | null {
  const current = clampPage(anchor)

  if (current === 1 || current === 604) return null

  return current % 2 === 0
    ? current + 1
    : current
}

function spreadRightPageNumber(anchor: number) {
  const current = clampPage(anchor)

  if (current === 1) return 1
  if (current === 604) return 604

  return current % 2 === 0
    ? current
    : current - 1
}

function spreadCompanionPageNumber(anchor: number) {
  const current = clampPage(anchor)

  if (current === 1) return 2
  if (current === 604) return 603

  return current % 2 === 0
    ? current + 1
    : current - 1
}

function resolveSpreadPage(
  wantedPage: number | null,
  routePage: MushafPage | null,
  companionPage: MushafPage | null,
) {
  if (wantedPage === null) return null

  if (routePage?.pageNumber === wantedPage) {
    return routePage
  }

  if (companionPage?.pageNumber === wantedPage) {
    return companionPage
  }

  return null
}

const pageNumber = computed(() => {
  const value = Number(route.params.page)

  return Number.isFinite(value)
    ? clampPage(value)
    : 1
})

const previousPageNumber = computed(() =>
  clampPage(pageNumber.value - 1),
)

const nextPageNumber = computed(() =>
  clampPage(pageNumber.value + 1),
)

const currentCompanionNumber = computed(() =>
  spreadCompanionPageNumber(pageNumber.value),
)

const currentLeftNumber = computed(() =>
  spreadLeftPageNumber(pageNumber.value),
)

const currentRightNumber = computed(() =>
  spreadRightPageNumber(pageNumber.value),
)

const nextSpreadAnchor = computed(() =>
  clampPage(pageNumber.value + 2),
)

const previousSpreadAnchor = computed(() =>
  clampPage(pageNumber.value - 2),
)

const nextSpreadCompanionNumber = computed(() =>
  spreadCompanionPageNumber(nextSpreadAnchor.value),
)

const previousSpreadCompanionNumber = computed(() =>
  spreadCompanionPageNumber(previousSpreadAnchor.value),
)

const primaryQuery = useMushafPage(pageNumber)
const companionQuery = useMushafPage(currentCompanionNumber)
const previousQuery = useMushafPage(previousPageNumber)
const nextQuery = useMushafPage(nextPageNumber)

const nextSpreadRouteQuery = useMushafPage(nextSpreadAnchor)
const nextSpreadCompanionQuery = useMushafPage(
  nextSpreadCompanionNumber,
)
const previousSpreadRouteQuery = useMushafPage(
  previousSpreadAnchor,
)
const previousSpreadCompanionQuery = useMushafPage(
  previousSpreadCompanionNumber,
)

const primaryPage = computed(() => primaryQuery.data.value ?? null)
const companionPage = computed(() => companionQuery.data.value ?? null)
const previousPage = computed(() => previousQuery.data.value ?? null)
const nextPage = computed(() => nextQuery.data.value ?? null)

const currentLeftPage = computed(() =>
  resolveSpreadPage(
    currentLeftNumber.value,
    primaryPage.value,
    companionPage.value,
  ),
)

const currentRightPage = computed(() =>
  resolveSpreadPage(
    currentRightNumber.value,
    primaryPage.value,
    companionPage.value,
  ),
)

const nextSpreadLeftPage = computed(() =>
  resolveSpreadPage(
    spreadLeftPageNumber(nextSpreadAnchor.value),
    nextSpreadRouteQuery.data.value ?? null,
    nextSpreadCompanionQuery.data.value ?? null,
  ),
)

const nextSpreadRightPage = computed(() =>
  resolveSpreadPage(
    spreadRightPageNumber(nextSpreadAnchor.value),
    nextSpreadRouteQuery.data.value ?? null,
    nextSpreadCompanionQuery.data.value ?? null,
  ),
)

const previousSpreadLeftPage = computed(() =>
  resolveSpreadPage(
    spreadLeftPageNumber(previousSpreadAnchor.value),
    previousSpreadRouteQuery.data.value ?? null,
    previousSpreadCompanionQuery.data.value ?? null,
  ),
)

const previousSpreadRightPage = computed(() =>
  resolveSpreadPage(
    spreadRightPageNumber(previousSpreadAnchor.value),
    previousSpreadRouteQuery.data.value ?? null,
    previousSpreadCompanionQuery.data.value ?? null,
  ),
)

const targetSpreadLeftPage = computed(() => {
  if (spreadTurnDirection.value === 'next') {
    return nextSpreadLeftPage.value
  }

  if (spreadTurnDirection.value === 'previous') {
    return previousSpreadLeftPage.value
  }

  return null
})

const targetSpreadRightPage = computed(() => {
  if (spreadTurnDirection.value === 'next') {
    return nextSpreadRightPage.value
  }

  if (spreadTurnDirection.value === 'previous') {
    return previousSpreadRightPage.value
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

const mobileCurrentStyle = computed(() => ({
  transform: `translate3d(${mobileDragX.value}px, 0, 0)`,
  transition: mobileTransitioning.value
    ? 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
    : 'none',
}))

const mobileNextStyle = computed(() => ({
  transform: `translate3d(calc(-100% + ${mobileDragX.value}px), 0, 0)`,
  transition: mobileTransitioning.value
    ? 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
    : 'none',
}))

const mobilePreviousStyle = computed(() => ({
  transform: `translate3d(calc(100% + ${mobileDragX.value}px), 0, 0)`,
  transition: mobileTransitioning.value
    ? 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)'
    : 'none',
}))

const spreadAngle = computed(() =>
  Math.min(158, spreadTurnProgress.value * 158),
)

const spreadStationaryOpacity = computed(() => {
  const progressAfterHalf = Math.max(
    0,
    (spreadTurnProgress.value - 0.42) / 0.58,
  )

  return Math.max(0, 1 - progressAfterHalf)
})

const spreadTransition = computed(() =>
  spreadSettling.value
    ? 'transform 280ms cubic-bezier(0.2, 0.72, 0.2, 1), opacity 220ms ease'
    : 'none',
)

const currentRightPaneStyle = computed(() => {
  if (spreadTurnDirection.value === 'previous') {
    return {
      transform: `perspective(1800px) rotateY(-${spreadAngle.value}deg)`,
      transformOrigin: 'left center',
      transition: spreadTransition.value,
      zIndex: 30,
    }
  }

  if (spreadTurnDirection.value === 'next') {
    return {
      opacity: spreadStationaryOpacity.value,
      transition: spreadTransition.value,
      zIndex: 20,
    }
  }

  return {
    transform: 'none',
    opacity: 1,
    zIndex: 20,
  }
})

const currentLeftPaneStyle = computed(() => {
  if (spreadTurnDirection.value === 'next') {
    return {
      transform: `perspective(1800px) rotateY(${spreadAngle.value}deg)`,
      transformOrigin: 'right center',
      transition: spreadTransition.value,
      zIndex: 30,
    }
  }

  if (spreadTurnDirection.value === 'previous') {
    return {
      opacity: spreadStationaryOpacity.value,
      transition: spreadTransition.value,
      zIndex: 20,
    }
  }

  return {
    transform: 'none',
    opacity: 1,
    zIndex: 20,
  }
})

function goBack() {
  void router.push('/quran')
}

function toggleControls() {
  controlsVisible.value = !controlsVisible.value
}

function readerTarget(direction: ReaderDirection) {
  const step = isSpreadViewport.value ? 2 : 1

  return direction === 'next'
    ? clampPage(pageNumber.value + step)
    : clampPage(pageNumber.value - step)
}

function canNavigate(direction: ReaderDirection) {
  return readerTarget(direction) !== pageNumber.value
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
    await delay(180)
    mobileTransitioning.value = false
    return
  }

  isTurning.value = true
  mobileTransitioning.value = true

  const distance = mobileViewport.value.clientWidth

  mobileDragX.value = direction === 'next'
    ? distance
    : -distance

  await delay(300)
  await router.push(`/quran/${readerTarget(direction)}`)
  await nextTick()

  mobileTransitioning.value = false
  mobileDragX.value = 0
  isTurning.value = false
}

async function settleSpreadTurn(
  direction: ReaderDirection,
  complete: boolean,
) {
  spreadSettling.value = true
  spreadTurnProgress.value = complete ? 1 : 0

  await delay(complete ? 280 : 180)

  if (complete) {
    await router.push(`/quran/${readerTarget(direction)}`)
    await nextTick()
  }

  spreadTurnDirection.value = null
  spreadTurnProgress.value = 0
  spreadSettling.value = false
  isTurning.value = false
}

async function animateSpreadTurn(direction: ReaderDirection) {
  if (isTurning.value || !canNavigate(direction)) return

  isTurning.value = true
  spreadTurnDirection.value = direction
  spreadTurnProgress.value = 0
  spreadSettling.value = true

  await nextTick()

  spreadTurnProgress.value = 1

  await delay(280)
  await router.push(`/quran/${readerTarget(direction)}`)
  await nextTick()

  spreadTurnDirection.value = null
  spreadTurnProgress.value = 0
  spreadSettling.value = false
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
  if (event.pointerType === 'mouse' || isTurning.value) {
    return
  }

  activePointerId.value = event.pointerId
  pointerStartX.value = event.clientX
  pointerStartY.value = event.clientY
  pointerStartedAt.value = performance.now()
  draggingHorizontally.value = false
  mobileTransitioning.value = false
  spreadSettling.value = false

  const surface = event.currentTarget

  if (surface instanceof HTMLElement) {
    surface.setPointerCapture(event.pointerId)
  }
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
      spreadTurnDirection.value = null
      spreadTurnProgress.value = 0
      return
    }

    draggingHorizontally.value = true
    suppressNextClick.value = true
  }

  if (isSpreadViewport.value) {
    const direction: ReaderDirection = dx >= 0
      ? 'next'
      : 'previous'

    if (!canNavigate(direction)) {
      spreadTurnDirection.value = null
      spreadTurnProgress.value = 0
      return
    }

    spreadTurnDirection.value = direction

    const halfWidth = Math.max(
      1,
      (event.currentTarget as HTMLElement).clientWidth / 2,
    )

    spreadTurnProgress.value = Math.min(
      1,
      Math.abs(dx) / halfWidth,
    )

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

  const direction: ReaderDirection = dx >= 0
    ? 'next'
    : 'previous'

  if (isSpreadViewport.value) {
    const progress = spreadTurnProgress.value
    const shouldTurn =
      progress >= 0.22
      || velocity >= 0.32

    isTurning.value = true

    void settleSpreadTurn(
      direction,
      shouldTurn && canNavigate(direction),
    )

    return
  }

  const threshold = Math.min(
    88,
    (mobileViewport.value?.clientWidth ?? window.innerWidth) * 0.18,
  )

  const shouldTurn =
    Math.abs(dx) >= threshold
    || velocity >= 0.42

  if (!shouldTurn) {
    mobileTransitioning.value = true
    mobileDragX.value = 0

    window.setTimeout(() => {
      mobileTransitioning.value = false
    }, 180)

    return
  }

  navigateReader(direction)
}

function handlePointerCancel(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) return

  activePointerId.value = null
  draggingHorizontally.value = false

  if (isSpreadViewport.value && spreadTurnDirection.value) {
    const direction = spreadTurnDirection.value

    isTurning.value = true
    void settleSpreadTurn(direction, false)
    return
  }

  mobileTransitioning.value = true
  mobileDragX.value = 0

  window.setTimeout(() => {
    mobileTransitioning.value = false
  }, 180)
}

function handleSpreadMediaChange(event: MediaQueryListEvent) {
  updateSpreadViewport(event.matches)
}

function updateSpreadViewport(matches: boolean) {
  isSpreadViewport.value = matches
  mobileDragX.value = 0
  mobileTransitioning.value = false
  spreadTurnDirection.value = null
  spreadTurnProgress.value = 0
  spreadSettling.value = false
  isTurning.value = false
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
  spreadMedia.addEventListener(
    'change',
    handleSpreadMediaChange,
  )

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

  spreadMedia?.removeEventListener(
    'change',
    handleSpreadMediaChange,
  )
})
</script>

<template>
  <main
    dir="rtl"
    class="relative min-h-dvh w-full overflow-x-hidden bg-[var(--sqc-color-background-primary)] min-[600px]:bg-[#fbf7ef] [font-family:var(--sqc-font-family-ui)]"
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
        class="relative mx-auto min-h-dvh w-full touch-pan-y overflow-hidden min-[600px]:bg-[#fbf7ef]"
        aria-label="صفحة المصحف"
        @click.capture="handleReaderClickCapture"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="finishPointerGesture"
        @pointercancel="handlePointerCancel"
      >
        <div
          v-if="nextPage && pageNumber < 604"
          class="pointer-events-none absolute inset-0 z-0 w-full will-change-transform"
          :style="mobileNextStyle"
          aria-hidden="true"
        >
          <QuranMushafPane :page="nextPage" />
        </div>

        <div
          v-if="previousPage && pageNumber > 1"
          class="pointer-events-none absolute inset-0 z-0 w-full will-change-transform"
          :style="mobilePreviousStyle"
          aria-hidden="true"
        >
          <QuranMushafPane :page="previousPage" />
        </div>

        <div
          class="relative z-10 w-full will-change-transform"
          :style="mobileCurrentStyle"
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
        </div>
      </section>

      <section
        v-else
        dir="rtl"
        class="relative mx-auto min-h-dvh w-full touch-pan-y overflow-hidden bg-[#fbf7ef] p-0 [perspective:1800px]"
        aria-label="صفحتا المصحف"
        @click.capture="handleReaderClickCapture"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="finishPointerGesture"
        @pointercancel="handlePointerCancel"
      >
        <div
          v-if="spreadTurnDirection"
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 z-0 grid grid-cols-2 items-start gap-px"
        >
          <QuranMushafPane
            v-if="targetSpreadRightPage"
            spread
            :page="targetSpreadRightPage"
          />

          <div
            v-else
            class="min-h-[90dvh]"
          />

          <QuranMushafPane
            v-if="targetSpreadLeftPage"
            spread
            :page="targetSpreadLeftPage"
          />

          <div
            v-else
            class="min-h-[90dvh]"
          />
        </div>

        <div
          class="relative z-10 grid grid-cols-2 items-start gap-px"
        >
          <div
            class="min-w-0 bg-[#fbf7ef] [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform"
            :style="currentRightPaneStyle"
          >
            <QuranMushafPane
              v-if="currentRightPage"
              spread
              :page="currentRightPage"
              :saved-verse-key="
                savedPosition?.page_number === currentRightPage.pageNumber
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
            class="min-w-0 bg-[#fbf7ef] [backface-visibility:hidden] [transform-style:preserve-3d] will-change-transform"
            :style="currentLeftPaneStyle"
          >
            <QuranMushafPane
              v-if="currentLeftPage"
              spread
              :page="currentLeftPage"
              :saved-verse-key="
                savedPosition?.page_number === currentLeftPage.pageNumber
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
