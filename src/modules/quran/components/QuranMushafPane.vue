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

const props = withDefaults(
  defineProps<{
    page: MushafPageData
    savedVerseKey?: string | null
    markerLabel?: string
    spread?: boolean
  }>(),
  {
    savedVerseKey: null,
    markerLabel: 'آخر موضع',
    spread: false,
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
const selectedWordLocation = ref<string | null>(null)
const markerPosition = ref<{
  top: number
  left: number
} | null>(null)

let resizeObserver: ResizeObserver | null = null
let measureFrame = 0

function selectorForVerse(verseKey: string) {
  if (typeof CSS !== 'undefined' && CSS.escape) {
    return `[data-verse-key="${CSS.escape(verseKey)}"]`
  }

  return `[data-verse-key="${verseKey.replaceAll('"', '\\"')}"]`
}

function measureSavedPosition() {
  const container = root.value
  const verseKey = props.savedVerseKey

  if (!container || !verseKey) {
    markerPosition.value = null
    return
  }

  const firstWord = container.querySelector<HTMLElement>(
    selectorForVerse(verseKey),
  )

  if (!firstWord) {
    markerPosition.value = null
    return
  }

  const containerRect = container.getBoundingClientRect()
  const wordRect = firstWord.getBoundingClientRect()

  markerPosition.value = {
    top: Math.max(
      props.spread ? 36 : 42,
      wordRect.top - containerRect.top - 26,
    ),
    left: Math.max(
      58,
      Math.min(
        wordRect.left - containerRect.left + (wordRect.width / 2),
        container.clientWidth - 58,
      ),
    ),
  }
}

async function scheduleMeasure() {
  await nextTick()

  if (measureFrame) {
    cancelAnimationFrame(measureFrame)
  }

  measureFrame = requestAnimationFrame(() => {
    measureFrame = 0
    measureSavedPosition()
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
  const location = word?.dataset.location
  const isVerseMarker = word?.dataset.verseMarker === 'true'

  if (!word || !verseKey || !location || isVerseMarker) {
    emit('toggle-controls')
    return
  }

  selectedWordLocation.value = location

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
  () => props.page.pageNumber,
  () => {
    selectedWordLocation.value = null
    void scheduleMeasure()
  },
)

watch(
  () => props.savedVerseKey,
  () => {
    void scheduleMeasure()
  },
)

onMounted(() => {
  void scheduleMeasure()

  if (root.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      void scheduleMeasure()
    })
    resizeObserver.observe(root.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (measureFrame) {
    cancelAnimationFrame(measureFrame)
    measureFrame = 0
  }
})
</script>

<template>
  <div
    ref="root"
    class="relative mx-auto h-dvh w-full overflow-hidden"
    :class="
      spread
        ? ''
        : 'max-w-[720px]'
    "
    @click="handleClick"
  >
    <MushafPage
      :page="page"
      :spread="spread"
      :selected-word-location="selectedWordLocation"
      class="!my-0 !rounded-none !shadow-none"
      :class="
        spread
          ? '!h-dvh !min-h-0 !max-w-none'
          : '!h-dvh !max-w-[720px]'
      "
    />

    <div
      v-if="markerPosition"
      aria-hidden="true"
      class="pointer-events-none absolute z-40 flex -translate-x-1/2 items-center gap-[5px]"
      :style="{
        top: `${markerPosition.top}px`,
        left: `${markerPosition.left}px`,
      }"
    >
      <span
        class="size-[7px] rotate-45 border border-[#9eafd0] bg-[#e9eef7]"
      />

      <span
        dir="rtl"
        class="rounded-[8px] border border-[#9eafd0] bg-[var(--sqc-color-mushaf-paper)] px-[7px] py-[2px] text-[10px] font-semibold leading-[14px] text-[#536f9f] shadow-sm [font-family:var(--sqc-font-family-ui)]"
      >
        {{ markerLabel }}
      </span>
    </div>
  </div>
</template>
