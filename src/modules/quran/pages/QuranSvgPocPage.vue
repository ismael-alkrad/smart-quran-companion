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
import { useMushafPage } from '@/modules/quran/composables/useMushafPage'
import { getJuzNameArabicVowelled } from '@/modules/quran/data/juzNames'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { getSurahNameArabicVowelled } from '@/modules/quran/data/surahNamesVowelled'
import { getQcfV2FontFamily } from '@/modules/quran/services/qcfFont.service'
import type { MushafWord } from '@/modules/quran/types/mushaf'
import { toArabicNumber } from '@/modules/quran/utils/number'

const POC_PAGE_NUMBER = 31

const selectedLocation = ref<string | null>(null)
const textSurface = ref<HTMLElement | null>(null)
const pageLineScale = ref(1)

const pageQuery = useMushafPage(POC_PAGE_NUMBER)

let resizeObserver: ResizeObserver | null = null
let fitFrame = 0

const page = computed(() => pageQuery.data.value ?? null)

const verseMarkerLocations = computed(() => {
  const currentPage = page.value
  if (!currentPage) return new Set<string>()

  const words = currentPage.lines.flatMap(line => line.words)
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

const surahName = computed(() => {
  const surahNumber = page.value?.chapters[0]

  return surahNumber
    ? getSurahNameArabic(surahNumber)
    : ''
})

const surahFrameLabel = computed(() => {
  const surahNumber = page.value?.chapters[0]

  return surahNumber
    ? getSurahNameArabicVowelled(surahNumber)
    : ''
})

const juzFrameLabel = computed(() => {
  const juzNumber = page.value?.juzNumber

  return juzNumber
    ? getJuzNameArabicVowelled(juzNumber)
    : ''
})

const fontFamily = computed(() =>
  getQcfV2FontFamily(POC_PAGE_NUMBER),
)

function selectWord(word: MushafWord) {
  selectedLocation.value = word.location

  console.info('[Quran Reading PoC] selected word', {
    page: word.pageNumber,
    verseKey: word.verseKey,
    wordPosition: word.position,
    location: word.location,
  })
}

function fitQcfLines() {
  const surface = textSurface.value
  if (!surface) return

  const lineNodes = Array.from(
    surface.querySelectorAll<HTMLElement>('[data-qcf-line]'),
  )

  if (!lineNodes.length) return

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

  if (widestLine <= 0) return

  pageLineScale.value = Math.min(
    1,
    (availableWidth / widestLine) * 0.95,
  )
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
  () => page.value?.pageNumber,
  () => {
    void scheduleLineFit()
  },
)

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
  <main
    class="h-dvh w-full overflow-hidden bg-[var(--sqc-color-mushaf-paper)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      v-if="pageQuery.isPending.value"
      class="grid h-full place-items-center px-[24px]"
    >
      <span
        class="text-[14px] text-[color:var(--sqc-color-mushaf-muted)]"
      >
        جاري تجهيز المصحف…
      </span>
    </div>

    <div
      v-else-if="pageQuery.isError.value || !page"
      class="grid h-full place-items-center px-[24px]"
    >
      <span
        class="text-center text-[14px] leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
      >
        تعذر تحميل صفحة المصحف المحلية.
      </span>
    </div>

    <article
      v-else
      dir="rtl"
      translate="no"
      class="relative mx-auto flex h-full w-full max-w-[520px] flex-col overflow-hidden bg-[var(--sqc-color-mushaf-paper)] [--sqc-poc-accent:#7189b7] [--sqc-poc-accent-strong:#536f9f] [--sqc-poc-accent-soft:#e9eef7] [--sqc-poc-accent-border:#9eafd0] [--sqc-poc-accent-muted:#8398bd] [--sqc-poc-marker:#6f89b8]"
      aria-label="تجربة صفحة المصحف على الهاتف"
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
        class="relative z-10 mt-[38px] grid min-h-0 flex-1 grid-rows-[repeat(15,minmax(0,1fr))] px-[30px] pb-[34px] pt-[4px]"
        aria-label="نص صفحة المصحف"
      >
        <div
          v-for="line in page.lines"
          :key="line.lineNumber"
          class="relative flex min-h-0 w-full items-center overflow-visible"
          :data-line-number="line.lineNumber"
          :data-line-type="line.type"
        >
          <div
            v-if="line.type === 'ayah'"
            :data-qcf-line="line.lineNumber"
            class="absolute left-1/2 inline-flex w-max shrink-0 origin-center items-baseline justify-center whitespace-nowrap text-[clamp(1.5rem,7.1vw,1.92rem)] leading-[1.08] text-[color:var(--sqc-color-mushaf-ink)] [font-kerning:normal] [text-rendering:optimizeLegibility]"
            :style="{
              fontFamily,
              transform: `translateX(-50%) scaleX(${pageLineScale})`,
            }"
          >
            <button
              v-for="word in line.words"
              :key="word.location"
              type="button"
              translate="no"
              class="inline-block shrink-0 rounded-[4px] border-0 bg-transparent p-0 text-inherit [font:inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sqc-color-border-focus)]"
              :class="[
                isVerseMarker(word)
                  ? 'text-[color:var(--sqc-poc-marker)]'
                  : '',
                selectedLocation === word.location
                  ? 'bg-[var(--sqc-poc-accent-soft)] text-[color:var(--sqc-poc-accent-strong)]'
                  : '',
              ]"
              :data-location="word.location"
              :data-verse-key="word.verseKey"
              :data-word-position="word.position"
              @click="selectWord(word)"
              v-html="word.codeV2"
            />
          </div>

          <div
            v-else-if="line.type === 'surah_name'"
            class="flex h-[32px] w-full items-center justify-center rounded-[12px] border border-[var(--sqc-color-mushaf-border-subtle)] text-center text-[14px] font-semibold text-[color:var(--sqc-color-mushaf-ink)]"
          >
            سورة {{ getSurahNameArabic(line.surahNumber ?? 0) }}
          </div>

          <div
            v-else
            class="text-center text-[22px] leading-none text-[color:var(--sqc-color-mushaf-ink)] [font-family:'Amiri_Quran','Noto_Naskh_Arabic',serif]"
          >
            ﷽
          </div>
        </div>
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
  </main>
</template>
