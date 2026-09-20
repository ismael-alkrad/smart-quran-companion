<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import { useMushafPage } from '@/modules/quran/composables/useMushafPage'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
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

const surahName = computed(() => {
  const surahNumber = page.value?.chapters[0]

  return surahNumber
    ? getSurahNameArabic(surahNumber)
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
    (availableWidth / widestLine) * 0.985,
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
      class="mx-auto flex h-full w-full max-w-[520px] flex-col bg-[var(--sqc-color-mushaf-paper)]"
      aria-label="تجربة صفحة المصحف على الهاتف"
    >
      <header
        class="mx-[14px] mt-[max(10px,env(safe-area-inset-top))] flex h-[44px] shrink-0 items-center justify-between rounded-[14px] border border-[var(--sqc-color-mushaf-border-subtle)] px-[14px] text-[color:var(--sqc-color-mushaf-ink)]"
      >
        <span
          class="min-w-0 flex-1 truncate text-right text-[13px] font-medium"
        >
          سورة {{ surahName }}
        </span>

        <span
          class="mx-[10px] shrink-0 text-[11px] text-[color:var(--sqc-color-mushaf-muted)]"
        >
          الصفحة {{ toArabicNumber(page.pageNumber) }}
        </span>

        <span
          class="min-w-0 flex-1 truncate text-left text-[13px] font-medium"
        >
          الجزء {{ toArabicNumber(page.juzNumber) }}
        </span>
      </header>

      <section
        ref="textSurface"
        class="grid min-h-0 flex-1 grid-rows-[repeat(15,minmax(0,1fr))] px-[22px] pb-[6px] pt-[10px]"
        aria-label="نص صفحة المصحف"
      >
        <div
          v-for="line in page.lines"
          :key="line.lineNumber"
          class="flex min-h-0 w-full items-center justify-center overflow-visible"
          :data-line-number="line.lineNumber"
          :data-line-type="line.type"
        >
          <div
            v-if="line.type === 'ayah'"
            :data-qcf-line="line.lineNumber"
            class="inline-flex w-max max-w-none origin-center items-baseline justify-center whitespace-nowrap text-[clamp(1.5rem,7.1vw,1.92rem)] leading-[1.08] text-[color:var(--sqc-color-mushaf-ink)] [font-kerning:normal] [text-rendering:optimizeLegibility]"
            :style="{
              fontFamily,
              transform: `scaleX(${pageLineScale})`,
            }"
          >
            <button
              v-for="word in line.words"
              :key="word.location"
              type="button"
              translate="no"
              class="inline-block shrink-0 rounded-[4px] border-0 bg-transparent p-0 text-inherit [font:inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sqc-color-border-focus)]"
              :class="
                selectedLocation === word.location
                  ? 'bg-[var(--sqc-color-action-primary)]/15 text-[color:var(--sqc-color-action-primary)]'
                  : ''
              "
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

      <footer
        class="flex h-[44px] shrink-0 items-start justify-center pb-[max(8px,env(safe-area-inset-bottom))] pt-[2px]"
      >
        <span
          class="flex min-h-[28px] min-w-[54px] items-center justify-center rounded-[12px] border border-[var(--sqc-color-mushaf-border-subtle)] px-[12px] text-[12px] font-medium text-[color:var(--sqc-color-mushaf-muted)]"
        >
          {{ toArabicNumber(page.pageNumber) }}
        </span>
      </footer>
    </article>
  </main>
</template>
