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
import { toArabicNumber } from '@/modules/quran/utils/number'

const props = withDefaults(
  defineProps<{
    page: MushafPageData
    spread?: boolean
    selectedWordLocation?: string | null
  }>(),
  {
    spread: false,
    selectedWordLocation: null,
  },
)

const textSurface = ref<HTMLElement | null>(null)
const pageLineScale = ref(1)
const lineFitReady = ref(false)

let resizeObserver: ResizeObserver | null = null
let fitFrame = 0

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

function fitQcfLines() {
  const surface = textSurface.value
  if (!surface) return

  const lineNodes = Array.from(
    surface.querySelectorAll<HTMLElement>('[data-qcf-line]'),
  )

  if (!lineNodes.length) {
    lineFitReady.value = true
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
    return
  }

  pageLineScale.value = Math.min(
    1,
    (availableWidth / widestLine) * 0.95,
  )
  lineFitReady.value = true
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
  ] as const,
  () => {
    lineFitReady.value = false
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
})
</script>

<template>
  <article
    dir="rtl"
    translate="no"
    class="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-[var(--sqc-color-mushaf-paper)] [--sqc-poc-accent:#7189b7] [--sqc-poc-accent-strong:#536f9f] [--sqc-poc-accent-soft:#e9eef7] [--sqc-poc-accent-border:#9eafd0] [--sqc-poc-accent-muted:#8398bd] [--sqc-poc-marker:#6f89b8]"
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
          v-if="line.type === 'ayah'"
          :data-qcf-line="line.lineNumber"
          class="absolute left-1/2 inline-flex w-max shrink-0 origin-center items-baseline justify-center whitespace-nowrap text-[clamp(1.5rem,7.1vw,1.92rem)] leading-[1.08] text-[color:var(--sqc-color-mushaf-ink)] [font-kerning:normal] [text-rendering:optimizeLegibility]"
          :class="lineFitReady ? 'visible' : 'invisible'"
          :style="{
            fontFamily,
            transform: `translateX(-50%) scaleX(${pageLineScale})`,
          }"
        >
          <span
            v-for="word in line.words"
            :key="word.location"
            class="inline-block shrink-0 cursor-pointer select-none rounded-[5px] transition-colors duration-100"
            :class="[
              isVerseMarker(word)
                ? 'text-[color:var(--sqc-poc-marker)]'
                : '',
              selectedWordLocation === word.location
                ? 'bg-[var(--sqc-poc-accent-soft)] text-[color:var(--sqc-poc-accent-strong)]'
                : '',
            ]"
            translate="no"
            :data-location="word.location"
            :data-verse-key="word.verseKey"
            :data-word-position="word.position"
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
