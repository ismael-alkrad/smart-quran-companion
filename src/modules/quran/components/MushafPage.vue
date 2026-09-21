<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import MushafFrameCartouche from '@/modules/quran/components/MushafFrameCartouche.vue'
import MushafHizbMarker from '@/modules/quran/components/MushafHizbMarker.vue'
import MushafSurahBanner from '@/modules/quran/components/MushafSurahBanner.vue'
import { getHizbMarkersForPage } from '@/modules/quran/data/hizbMarkers'
import { getJuzNameArabicVowelled } from '@/modules/quran/data/juzNames'
import { getSurahNameArabicVowelled } from '@/modules/quran/data/surahNamesVowelled'
import { getQcfV2FontFamily } from '@/modules/quran/services/qcfFont.service'
import type {
  MushafPage as MushafPageData,
  MushafWord,
} from '@/modules/quran/types/mushaf'
import type { QuranHifzReaderContext } from '@/modules/quran/types/reader'
import { toArabicNumber } from '@/modules/quran/utils/number'

const props = withDefaults(
  defineProps<{
    page: MushafPageData
    spread?: boolean
    selectedWordLocation?: string | null
    hifzContext?: QuranHifzReaderContext | null
  }>(),
  {
    spread: false,
    selectedWordLocation: null,
    hifzContext: null,
  },
)

interface HifzLineHighlightSegment {
  left: number
  width: number
  top: number
  height: number
}

const textSurface = ref<HTMLElement | null>(null)
const pageLineScale = ref(1)
const lineFitReady = ref(false)
const hifzLineHighlights = ref<Record<number, HifzLineHighlightSegment[]>>({})

let resizeObserver: ResizeObserver | null = null
let fitFrame = 0
let hifzHighlightFrame = 0

const fontFamily = computed(() =>
  getQcfV2FontFamily(props.page.pageNumber),
)

const surahFrameLabel = computed(() => {
  const surahNumber = props.page.chapters[0]

  return surahNumber
    ? getSurahNameArabicVowelled(surahNumber)
    : ''
})

const juzFrameLabel = computed(() =>
  getJuzNameArabicVowelled(props.page.juzNumber),
)

const hizbMarkers = computed(() =>
  getHizbMarkersForPage(props.page),
)

const pageOuterSide = computed<'left' | 'right'>(() =>
  props.page.pageNumber % 2 === 0
    ? 'left'
    : 'right',
)

const verseMarkerLocations = computed(() => {
  const words = props.page.lines.flatMap(line => line.words)
  const markers = new Set<string>()

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index]
    const nextWord = words[index + 1]

    if (!word) continue

    if (!nextWord || nextWord.verseKey !== word.verseKey) {
      markers.add(word.location)
    }
  }

  return markers
})

function isVerseMarker(word: MushafWord) {
  return verseMarkerLocations.value.has(word.location)
}

function isHifzAssignmentWord(word: MushafWord) {
  const context = props.hifzContext

  if (!context) return false

  const [surahText, ayahText] = word.verseKey.split(':')
  const surahNumber = Number(surahText)
  const ayahNumber = Number(ayahText)

  return (
    surahNumber === context.surahNumber
    && Number.isInteger(ayahNumber)
    && ayahNumber >= context.startAyah
    && ayahNumber <= context.endAyah
  )
}

function clearHifzLineHighlights() {
  hifzLineHighlights.value = {}
}

function measureHifzLineHighlights() {
  const surface = textSurface.value

  if (!surface || !lineFitReady.value || !props.hifzContext) {
    clearHifzLineHighlights()
    return
  }

  const nextHighlights: Record<number, HifzLineHighlightSegment[]> = {}
  const lineNodes = Array.from(
    surface.querySelectorAll<HTMLElement>(
      '[data-line-number][data-line-type="ayah"]',
    ),
  )

  for (const lineNode of lineNodes) {
    const lineNumber = Number(lineNode.dataset.lineNumber)

    if (!Number.isInteger(lineNumber)) continue

    const qcfLine = lineNode.querySelector<HTMLElement>('[data-qcf-line]')
    if (!qcfLine) continue

    const wordNodes = Array.from(
      qcfLine.querySelectorAll<HTMLElement>('[data-verse-key]'),
    )
    const runs: HTMLElement[][] = []
    let currentRun: HTMLElement[] = []

    function flushRun() {
      if (currentRun.length) {
        runs.push(currentRun)
        currentRun = []
      }
    }

    for (const wordNode of wordNodes) {
      const belongsToAssignment = wordNode.dataset.hifzAssignment === 'true'
      const isMarker = wordNode.dataset.verseMarker === 'true'

      if (!belongsToAssignment || isMarker) {
        flushRun()
        continue
      }

      currentRun.push(wordNode)
    }

    flushRun()

    if (!runs.length) continue

    const lineRect = lineNode.getBoundingClientRect()
    const height = Math.max(
      11,
      Math.min(15, Math.round(lineRect.height * 0.34)),
    )
    const top = Math.min(
      Math.max(0, lineRect.height - height),
      Math.round(lineRect.height * 0.56),
    )

    nextHighlights[lineNumber] = runs
      .map((run) => {
        const rects = run.map(node => node.getBoundingClientRect())
        const left = Math.min(...rects.map(rect => rect.left)) - lineRect.left
        const right = Math.max(...rects.map(rect => rect.right)) - lineRect.left

        return {
          left: Math.max(0, left - 2),
          width: Math.max(0, right - left + 4),
          top,
          height,
        }
      })
      .filter(segment => segment.width > 0)
  }

  hifzLineHighlights.value = nextHighlights
}

async function scheduleHifzLineHighlights() {
  await nextTick()

  if (hifzHighlightFrame) {
    cancelAnimationFrame(hifzHighlightFrame)
  }

  hifzHighlightFrame = requestAnimationFrame(() => {
    hifzHighlightFrame = 0
    measureHifzLineHighlights()
  })
}

function fitQcfLines() {
  const surface = textSurface.value
  if (!surface) return

  const lineNodes = Array.from(
    surface.querySelectorAll<HTMLElement>('[data-qcf-line]'),
  )

  if (!lineNodes.length) {
    lineFitReady.value = true
    clearHifzLineHighlights()
    return
  }

  const styles = getComputedStyle(surface)
  const horizontalPadding =
    Number.parseFloat(styles.paddingLeft)
    + Number.parseFloat(styles.paddingRight)

  const availableWidth = Math.max(
    1,
    surface.clientWidth - horizontalPadding,
  )

  const widestLine = Math.max(
    ...lineNodes.map(node => node.scrollWidth),
  )

  if (widestLine <= 0) {
    lineFitReady.value = true
    clearHifzLineHighlights()
    return
  }

  pageLineScale.value = Math.min(
    1,
    (availableWidth / widestLine) * 0.95,
  )
  lineFitReady.value = true
  void scheduleHifzLineHighlights()
}

async function scheduleLineFit() {
  await nextTick()

  if (fitFrame) {
    cancelAnimationFrame(fitFrame)
  }

  fitFrame = requestAnimationFrame(() => {
    fitFrame = 0
    fitQcfLines()
  })
}

watch(
  () => [
    props.page.pageNumber,
    props.spread,
    props.hifzContext?.surahNumber ?? null,
    props.hifzContext?.startAyah ?? null,
    props.hifzContext?.endAyah ?? null,
  ] as const,
  () => {
    lineFitReady.value = false
    clearHifzLineHighlights()
    void scheduleLineFit()
  },
)

watch(textSurface, (surface, previousSurface) => {
  if (!resizeObserver) return

  if (previousSurface) {
    resizeObserver.unobserve(previousSurface)
  }

  if (surface) {
    resizeObserver.observe(surface)
    void scheduleLineFit()
  }
})

onMounted(() => {
  void scheduleLineFit()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      void scheduleLineFit()
    })

    if (textSurface.value) {
      resizeObserver.observe(textSurface.value)
    }
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (fitFrame) {
    cancelAnimationFrame(fitFrame)
    fitFrame = 0
  }

  if (hifzHighlightFrame) {
    cancelAnimationFrame(hifzHighlightFrame)
    hifzHighlightFrame = 0
  }

  clearHifzLineHighlights()
})
</script>

<template>
  <article
    dir="rtl"
    translate="no"
    class="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-[var(--sqc-color-mushaf-paper)] [--sqc-poc-accent:#7189b7] [--sqc-poc-accent-strong:#536f9f] [--sqc-poc-accent-soft:#e9eef7] [--sqc-poc-accent-border:#9eafd0] [--sqc-poc-accent-muted:#8398bd] [--sqc-poc-marker:#6f89b8] [--sqc-poc-hifz-wash:rgba(158,175,208,0.25)]"
    :class="
      spread
        ? 'min-h-0 max-w-none'
        : 'max-w-[520px] min-[600px]:max-w-[720px]'
    "
    :aria-label="`صفحة المصحف ${toArabicNumber(page.pageNumber)}`"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-[12px] z-20 border-[12px] border-solid border-transparent opacity-[0.62] [border-image-outset:0] [border-image-repeat:round_round] [border-image-slice:30%_30.5%] [border-image-source:url('/quran/decor/mushaf-frame-blue.svg')] [border-image-width:1.35em]"
    />

    <div
      class="pointer-events-none absolute inset-x-[28px] top-[2px] z-30 flex items-center justify-between"
      aria-hidden="true"
    >
      <MushafFrameCartouche>
        {{ juzFrameLabel }}
      </MushafFrameCartouche>

      <MushafFrameCartouche>
        {{ surahFrameLabel }}
      </MushafFrameCartouche>
    </div>

    <section
      ref="textSurface"
      class="relative z-30 mt-[38px] grid min-h-0 flex-1 grid-rows-[repeat(15,minmax(0,1fr))] px-[30px] pb-[34px] pt-[4px]"
      aria-label="نص صفحة المصحف"
    >
      <div
        v-for="line in page.lines"
        :key="line.lineNumber"
        class="relative flex min-h-0 w-full items-center justify-center overflow-visible"
        :data-line-number="line.lineNumber"
        :data-line-type="line.type"
      >
        <div
          v-for="(segment, index) in hifzLineHighlights[line.lineNumber] ?? []"
          :key="`hifz-${line.lineNumber}-${index}`"
          aria-hidden="true"
          class="pointer-events-none absolute z-0 rounded-[5px] bg-[var(--sqc-poc-hifz-wash)]"
          :style="{
            left: `${segment.left}px`,
            width: `${segment.width}px`,
            top: `${segment.top}px`,
            height: `${segment.height}px`,
          }"
        />

        <div
          v-if="line.type === 'ayah'"
          :data-qcf-line="line.lineNumber"
          class="absolute left-1/2 z-10 inline-flex w-max shrink-0 origin-center items-baseline justify-center whitespace-nowrap text-[clamp(1.5rem,7.1vw,1.92rem)] leading-[1.08] text-[color:var(--sqc-color-mushaf-ink)] [font-kerning:normal] [text-rendering:optimizeLegibility]"
          :class="lineFitReady ? 'visible' : 'invisible'"
          :style="{
            fontFamily,
            transform: `translateX(-50%) scaleX(${pageLineScale})`,
          }"
        >
          <span
            v-for="word in line.words"
            :key="word.location"
            class="inline-block shrink-0 select-none rounded-[5px] transition-colors duration-100"
            :class="[
              isVerseMarker(word)
                ? 'cursor-default text-[color:var(--sqc-poc-marker)]'
                : 'cursor-pointer',
              selectedWordLocation === word.location && !isVerseMarker(word)
                ? 'bg-[var(--sqc-poc-accent-soft)] text-[color:var(--sqc-poc-accent-strong)]'
                : '',
            ]"
            translate="no"
            :data-location="word.location"
            :data-verse-key="word.verseKey"
            :data-word-position="word.position"
            :data-verse-marker="isVerseMarker(word) ? 'true' : undefined"
            :data-hifz-assignment="isHifzAssignmentWord(word) ? 'true' : undefined"
            v-html="word.codeV2"
          />
        </div>

        <MushafSurahBanner
          v-else-if="line.type === 'surah_name'"
          :label="
            getSurahNameArabicVowelled(
              line.surahNumber ?? page.chapters[0] ?? 0,
            )
          "
        />

        <div
          v-else
          class="text-center text-[22px] leading-none text-[color:var(--sqc-color-mushaf-ink)] [font-family:'Amiri_Quran','Noto_Naskh_Arabic',serif]"
        >
          ﷽
        </div>
      </div>

      <MushafHizbMarker
        v-for="marker in hizbMarkers"
        :key="marker.globalQuarter"
        :marker="marker"
        :side="pageOuterSide"
        class="-translate-y-1/2"
        :style="{
          top: `${((marker.lineNumber - 0.5) / 15) * 100}%`,
        }"
      />
    </section>

    <div
      class="pointer-events-none absolute bottom-[1px] left-1/2 z-30 -translate-x-1/2"
      aria-hidden="true"
    >
      <MushafFrameCartouche compact>
        {{ toArabicNumber(page.pageNumber) }}
      </MushafFrameCartouche>
    </div>
  </article>
</template>
