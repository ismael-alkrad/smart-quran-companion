<script setup lang="ts">
import { computed, ref } from 'vue'

import page67Raw from '@/modules/quran/poc/assets/067.svg?raw'
import page68Raw from '@/modules/quran/poc/assets/068.svg?raw'
import { toArabicNumber } from '@/modules/quran/utils/number'

interface SelectedWord {
  pageNumber: number
  surahNumber: number
  ayahNumber: number
  wordIndex: number
  hafs: string
  imlaey: string
}

interface HighlightedPath {
  element: SVGPathElement
  fill: string | null
}

const selectedWord = ref<SelectedWord | null>(null)

let highlightedPaths: HighlightedPath[] = []

function prepareInlineSvg(markup: string) {
  return markup
    .replace(/^\uFEFF/, '')
    .replace(/^<\?xml[^>]*>\s*/i, '')
}

const page67Svg = prepareInlineSvg(page67Raw)
const page68Svg = prepareInlineSvg(page68Raw)

const selectedLabel = computed(() => {
  const word = selectedWord.value

  if (!word) {
    return 'اضغط على أي كلمة لاختبار metadata و highlight'
  }

  return [
    `صفحة ${toArabicNumber(word.pageNumber)}`,
    `سورة ${toArabicNumber(word.surahNumber)}`,
    `آية ${toArabicNumber(word.ayahNumber)}`,
    `الكلمة ${toArabicNumber(word.wordIndex)}`,
    word.hafs,
  ].join(' · ')
})

function clearHighlight() {
  for (const { element, fill } of highlightedPaths) {
    if (fill === null) {
      element.removeAttribute('fill')
    } else {
      element.setAttribute('fill', fill)
    }
  }

  highlightedPaths = []
}

function highlightWord(word: Element) {
  clearHighlight()

  const paths = word.querySelectorAll<SVGPathElement>('path')

  highlightedPaths = Array.from(paths, (element) => ({
    element,
    fill: element.getAttribute('fill'),
  }))

  for (const { element } of highlightedPaths) {
    element.setAttribute(
      'fill',
      'var(--sqc-color-mushaf-accent)',
    )
  }
}

function readIntegerAttribute(
  element: Element,
  attribute: string,
) {
  const value = Number(element.getAttribute(attribute))

  return Number.isInteger(value)
    ? value
    : null
}

function handleWordClick(
  event: MouseEvent,
  pageNumber: number,
) {
  const target = event.target

  if (!(target instanceof Element)) return

  const word = target.closest('[id^="md-word-"]')

  if (!word) return

  const surahNumber = readIntegerAttribute(word, 'data-surah')
  const ayahNumber = readIntegerAttribute(word, 'data-aya')
  const wordIndex = readIntegerAttribute(
    word,
    'data-word-index-in-ayah',
  )

  if (
    surahNumber === null
    || ayahNumber === null
    || wordIndex === null
  ) {
    return
  }

  highlightWord(word)

  selectedWord.value = {
    pageNumber,
    surahNumber,
    ayahNumber,
    wordIndex,
    hafs: word.getAttribute('data-hafs') ?? '',
    imlaey: word.getAttribute('data-imlaey') ?? '',
  }

  console.info('[Quran SVG PoC] selected word', {
    page: pageNumber,
    surah: surahNumber,
    ayah: ayahNumber,
    wordIndex,
    hafs: selectedWord.value.hafs,
    imlaey: selectedWord.value.imlaey,
  })
}
</script>

<template>
  <main
    class="relative h-dvh w-full overflow-hidden bg-[var(--sqc-color-mushaf-paper)] [font-family:var(--sqc-font-family-ui)]"
  >
    <section
      dir="rtl"
      class="grid h-full w-full grid-cols-1 items-center overflow-hidden bg-[var(--sqc-color-mushaf-paper)] lg:landscape:grid-cols-2 lg:landscape:gap-px lg:landscape:bg-[var(--sqc-color-mushaf-border-subtle)]"
      aria-label="تجربة مصحف SVG للصفحتين ٦٧ و٦٨"
    >
      <article
        class="flex h-full min-w-0 items-center justify-center overflow-hidden bg-[var(--sqc-color-mushaf-paper)]"
        aria-label="صفحة ٦٧"
      >
        <div
          class="h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:max-w-full [&>svg]:select-none"
          v-html="page67Svg"
          @click="handleWordClick($event, 67)"
        />
      </article>

      <article
        class="hidden h-full min-w-0 items-center justify-center overflow-hidden bg-[var(--sqc-color-mushaf-paper)] lg:landscape:flex"
        aria-label="صفحة ٦٨"
      >
        <div
          class="h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:max-w-full [&>svg]:select-none"
          v-html="page68Svg"
          @click="handleWordClick($event, 68)"
        />
      </article>
    </section>

    <div
      class="pointer-events-none fixed inset-x-[12px] bottom-[max(12px,env(safe-area-inset-bottom))] z-20 flex justify-center"
    >
      <div
        class="max-w-[760px] rounded-[var(--sqc-dimension-radius-16)] border border-[var(--sqc-color-mushaf-border-subtle)] bg-[var(--sqc-color-mushaf-overlay)] px-[16px] py-[10px] text-center shadow-lg backdrop-blur"
      >
        <p
          dir="rtl"
          class="text-[12px] font-medium leading-[20px] text-[color:var(--sqc-color-mushaf-ink)]"
        >
          {{ selectedLabel }}
        </p>
      </div>
    </div>
  </main>
</template>
