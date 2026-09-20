<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import MushafPage from '@/modules/quran/components/MushafPage.vue'
import type { MushafPage as MushafPageData } from '@/modules/quran/types/mushaf'

interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

const props = withDefaults(
  defineProps<{
    page: MushafPageData
    savedVerseKey?: string | null
    markerLabel?: string
  }>(),
  {
    savedVerseKey: null,
    markerLabel: 'آخر موضع',
  },
)

const emit = defineEmits<{
  'select-ayah': [
    payload: {
      pageNumber: number
      surahNumber: number
      ayahNumber: number
    },
  ]
  'toggle-controls': []
}>()

const root = ref<HTMLElement | null>(null)
const highlightRects = ref<HighlightRect[]>([])
const markerPosition = ref<{ top: number; left: number } | null>(null)

let resizeObserver: ResizeObserver | null = null

function selectorForVerse(verseKey: string) {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return `[data-verse-key="${CSS.escape(verseKey)}"]`
  }

  return `[data-verse-key="${verseKey.replaceAll('"', '\\"')}"]`
}

function measureSavedAyah() {
  const container = root.value
  const verseKey = props.savedVerseKey

  if (!container || !verseKey) {
    highlightRects.value = []
    markerPosition.value = null
    return
  }

  const words = Array.from(
    container.querySelectorAll<HTMLElement>(
      selectorForVerse(verseKey),
    ),
  )

  if (!words.length) {
    highlightRects.value = []
    markerPosition.value = null
    return
  }

  const containerRect = container.getBoundingClientRect()
  const byLine = new Map<HTMLElement, DOMRect[]>()

  for (const word of words) {
    const line = word.closest<HTMLElement>('[data-line-number]')

    if (!line) continue

    const rects = byLine.get(line) ?? []
    rects.push(word.getBoundingClientRect())
    byLine.set(line, rects)
  }

  const measured = Array.from(byLine.values())
    .map((rects) => {
      const left = Math.min(...rects.map(rect => rect.left))
      const right = Math.max(...rects.map(rect => rect.right))
      const top = Math.min(...rects.map(rect => rect.top))
      const bottom = Math.max(...rects.map(rect => rect.bottom))

      return {
        top: top - containerRect.top - 2,
        left: left - containerRect.left - 3,
        width: right - left + 6,
        height: bottom - top + 4,
      }
    })
    .sort((a, b) => a.top - b.top)

  highlightRects.value = measured

  const first = measured[0]

  markerPosition.value = first
    ? {
        top: Math.max(8, first.top - 30),
        left: Math.max(8, Math.min(first.left, container.clientWidth - 88)),
      }
    : null
}

async function scheduleMeasure() {
  await nextTick()

  requestAnimationFrame(() => {
    measureSavedAyah()
  })
}

function handleClick(event: MouseEvent) {
  const target = event.target

  if (!(target instanceof Element)) {
    emit('toggle-controls')
    return
  }

  const word = target.closest<HTMLElement>('[data-verse-key]')
  const verseKey = word?.dataset.verseKey

  if (!verseKey) {
    emit('toggle-controls')
    return
  }

  const [surahText, ayahText] = verseKey.split(':')
  const surahNumber = Number(surahText)
  const ayahNumber = Number(ayahText)

  if (
    !Number.isInteger(surahNumber)
    || !Number.isInteger(ayahNumber)
  ) {
    return
  }

  emit('select-ayah', {
    pageNumber: props.page.pageNumber,
    surahNumber,
    ayahNumber,
  })
}

watch(
  () => [props.savedVerseKey, props.page.pageNumber],
  () => {
    void scheduleMeasure()
  },
)

onMounted(() => {
  void scheduleMeasure()

  if (root.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      measureSavedAyah()
    })
    resizeObserver.observe(root.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    ref="root"
    class="relative w-full overflow-hidden"
    @click="handleClick"
  >
    <MushafPage
      :page="page"
      class="!my-0 !max-w-none !rounded-none !shadow-none"
    />

    <div
      v-if="highlightRects.length"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-10"
    >
      <span
        v-for="(rect, index) in highlightRects"
        :key="index"
        class="absolute rounded-[6px] bg-[var(--sqc-color-action-primary)] opacity-[0.12]"
        :style="{
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }"
      />

      <span
        v-if="markerPosition"
        dir="rtl"
        class="absolute z-20 rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-action-primary)] px-[8px] py-[4px] text-[11px] font-medium leading-[16px] text-[color:var(--sqc-color-text-inverse)] [font-family:var(--sqc-font-family-ui)]"
        :style="{
          top: `${markerPosition.top}px`,
          left: `${markerPosition.left}px`,
        }"
      >
        {{ markerLabel }}
      </span>
    </div>
  </div>
</template>
