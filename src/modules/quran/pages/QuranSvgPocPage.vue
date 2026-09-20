<script setup lang="ts">
import { ref } from 'vue'

import page67Raw from '@/modules/quran/poc/assets/067.svg?raw'
import page68Raw from '@/modules/quran/poc/assets/068.svg?raw'

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
  inlineFill: string
}

const page67Image = 'https://equran.me/assets/images/pages/0067.jpg'
const page68Image = 'https://equran.me/assets/images/pages/0068.jpg'

const selectedWord = ref<SelectedWord | null>(null)

let highlightedPaths: HighlightedPath[] = []

function prepareInlineSvg(markup: string) {
  return markup
    .replace(/^\uFEFF/, '')
    .replace(/^<\?xml[^>]*>\s*/i, '')
}

const page67Svg = prepareInlineSvg(page67Raw)
const page68Svg = prepareInlineSvg(page68Raw)

function clearHighlight() {
  for (const { element, inlineFill } of highlightedPaths) {
    if (inlineFill) {
      element.style.fill = inlineFill
    } else {
      element.style.removeProperty('fill')
    }
  }

  highlightedPaths = []
}

function highlightWord(word: Element) {
  clearHighlight()

  const paths = word.querySelectorAll<SVGPathElement>('path')

  highlightedPaths = Array.from(paths, (element) => ({
    element,
    inlineFill: element.style.fill,
  }))

  for (const { element } of highlightedPaths) {
    element.style.fill = 'var(--sqc-color-mushaf-accent)'
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

  console.info('[Quran Hybrid PoC] selected word', {
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
    class="h-dvh w-full overflow-hidden bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <section
      dir="rtl"
      class="grid h-full w-full grid-cols-1 overflow-hidden lg:landscape:grid-cols-2"
      aria-label="تجربة المصحف الهجين للصفحتين ٦٧ و٦٨"
    >
      <article
        class="relative flex h-full min-w-0 items-center justify-center overflow-hidden bg-[var(--sqc-color-background-primary)]"
        aria-label="صفحة ٦٧"
      >
        <img
          :src="page67Image"
          alt="صفحة ٦٧ من مصحف المدينة"
          draggable="false"
          class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        >

        <div
          class="absolute inset-0 h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:select-none [&>svg_path]:fill-transparent"
          v-html="page67Svg"
          @click="handleWordClick($event, 67)"
        />
      </article>

      <article
        class="relative hidden h-full min-w-0 items-center justify-center overflow-hidden bg-[var(--sqc-color-background-primary)] lg:landscape:flex"
        aria-label="صفحة ٦٨"
      >
        <img
          :src="page68Image"
          alt="صفحة ٦٨ من مصحف المدينة"
          draggable="false"
          class="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
        >

        <div
          class="absolute inset-0 h-full w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:select-none [&>svg_path]:fill-transparent"
          v-html="page68Svg"
          @click="handleWordClick($event, 68)"
        />
      </article>
    </section>
  </main>
</template>
