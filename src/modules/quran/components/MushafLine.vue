<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

import MushafWord from '@/modules/quran/components/MushafWord.vue'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import type { MushafLine } from '@/modules/quran/types/mushaf'

const props = withDefaults(
  defineProps<{
    line: MushafLine
    fontFamily: string
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const host = ref<HTMLElement | null>(null)
const ayahContent = ref<HTMLElement | null>(null)
const fittedFontSize = ref<string>()

let resizeObserver: ResizeObserver | null = null
let measureFrame = 0

function cancelScheduledMeasure() {
  if (measureFrame) {
    cancelAnimationFrame(measureFrame)
    measureFrame = 0
  }
}

function shouldFitAyahLine() {
  if (props.compact) return false
  if (typeof window === 'undefined') return true

  return !window.matchMedia('(min-width: 600px)').matches
}

async function fitAyahLine() {
  if (
    props.line.type !== 'ayah'
    || !shouldFitAyahLine()
  ) {
    fittedFontSize.value = undefined
    cancelScheduledMeasure()
    return
  }

  await nextTick()
  cancelScheduledMeasure()

  fittedFontSize.value = undefined
  await nextTick()

  measureFrame = requestAnimationFrame(() => {
    measureFrame = 0

    const wrapper = host.value
    const content = ayahContent.value

    if (!wrapper || !content) return

    const availableWidth = content.clientWidth
    const naturalWidth = content.scrollWidth

    if (
      availableWidth <= 0
      || naturalWidth <= availableWidth + 1
    ) {
      return
    }

    const computedSize = Number.parseFloat(
      getComputedStyle(content).fontSize,
    )

    if (!Number.isFinite(computedSize) || computedSize <= 0) {
      return
    }

    const ratio = (availableWidth - 2) / naturalWidth
    const nextSize = Math.max(
      15.5,
      Math.floor(computedSize * ratio * 100) / 100,
    )

    fittedFontSize.value = `${nextSize}px`

    requestAnimationFrame(() => {
      const latestContent = ayahContent.value
      const latestWrapper = host.value

      if (!latestContent || !latestWrapper) return

      const overflowWidth = latestContent.scrollWidth

      if (overflowWidth <= latestWrapper.clientWidth + 1) {
        return
      }

      const currentSize = Number.parseFloat(
        getComputedStyle(latestContent).fontSize,
      )

      if (!Number.isFinite(currentSize) || currentSize <= 15.5) {
        return
      }

      const correction =
        (latestWrapper.clientWidth - 2)
        / overflowWidth

      fittedFontSize.value = `${Math.max(
        15.5,
        Math.floor(currentSize * correction * 100) / 100,
      )}px`
    })
  })
}

watch(
  () => [
    props.line.lineNumber,
    props.line.words.length,
    props.fontFamily,
    props.compact,
  ],
  () => {
    void fitAyahLine()
  },
)

onMounted(async () => {
  await fitAyahLine()

  if (host.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      void fitAyahLine()
    })
    resizeObserver.observe(host.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  cancelScheduledMeasure()
})
</script>

<template>
  <div
    ref="host"
    class="flex w-full min-w-0 items-center justify-center overflow-visible"
    :class="{ 'justify-center': line.type !== 'ayah' }"
    dir="rtl"
    translate="no"
    :data-line-number="line.lineNumber"
    :data-line-type="line.type"
  >
    <template v-if="line.type === 'ayah'">
      <div
        ref="ayahContent"
        class="mx-auto flex min-w-0 max-w-full items-baseline whitespace-nowrap text-[#11100f] [font-kerning:normal] [text-rendering:optimizeLegibility]"
        :class="[
          compact
            ? 'text-[clamp(1rem,2.15vw,1.45rem)] leading-[1.28]'
            : 'text-[clamp(1.48rem,6vw,1.9rem)] leading-[1.5] max-[380px]:text-[clamp(1.36rem,6.15vw,1.62rem)]',
          line.centered
            ? 'w-auto justify-center gap-[0.12em]'
            : 'w-[calc(100%_-_8px)] justify-between',
        ]"
        :style="{
          fontFamily,
          fontSize: fittedFontSize,
        }"
      >
        <MushafWord
          v-for="word in line.words"
          :key="word.location"
          :word="word"
        />
      </div>
    </template>

    <div
      v-else-if="line.type === 'surah_name'"
      class="relative text-center font-semibold text-[#302a23] [font-family:'Noto_Naskh_Arabic','Amiri',serif] before:absolute before:top-px before:right-0 before:left-0 before:h-px before:bg-[#b8a27f]/70 before:content-[''] after:absolute after:right-0 after:bottom-px after:left-0 after:h-px after:bg-[#b8a27f]/70 after:content-['']"
      :class="compact ? 'w-[82%] py-[2px] text-[0.76rem]' : 'w-[min(84%,320px)] py-[5px] text-[0.98rem]'"
    >
      {{ getSurahNameArabic(line.surahNumber ?? 0) }}
    </div>

    <div
      v-else
      class="text-center text-[#1a1815] [font-family:'Amiri_Quran','Noto_Naskh_Arabic',serif]"
      :class="compact ? 'text-[0.94rem] leading-[1.3]' : 'text-[1.28rem] leading-[1.55]'"
    >
      ﷽
    </div>
  </div>
</template>
