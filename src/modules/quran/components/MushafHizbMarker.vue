<script setup lang="ts">
import { computed } from 'vue'

import type { MushafHizbMarker } from '@/modules/quran/data/hizbMarkers'

const props = defineProps<{
  marker: MushafHizbMarker
  side: 'left' | 'right'
}>()

const labelLines = computed(() => {
  if (props.marker.phase === 'hizb') {
    return ['الْحِزْبُ']
  }

  if (props.marker.phase === 'quarter') {
    return ['رُبْعُ', 'الْحِزْبِ']
  }

  if (props.marker.phase === 'half') {
    return ['نِصْفُ', 'الْحِزْبِ']
  }

  return ['ثَلَاثَةُ', 'أَرْبَاعِ', 'الْحِزْبِ']
})
</script>

<template>
  <div
    class="pointer-events-none absolute z-40 flex min-h-[66px] w-[42px] flex-col items-center justify-center px-[3px] py-[5px] text-center text-[color:var(--sqc-poc-accent-strong)]"
    :class="
      side === 'left'
        ? 'left-[2px]'
        : 'right-[2px]'
    "
  >
    <svg
      viewBox="0 0 44 76"
      preserveAspectRatio="none"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path
        d="M22 1 29 7H36C40 7 43 10 43 14V62C43 66 40 69 36 69H29L22 75 15 69H8C4 69 1 66 1 62V14C1 10 4 7 8 7H15Z"
        fill="var(--sqc-color-mushaf-paper)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.1"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M22 7 26 11 22 15 18 11ZM22 61 26 65 22 69 18 65Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width=".8"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M7 18H37M7 58H37"
        fill="none"
        stroke="var(--sqc-poc-accent-soft)"
        stroke-width=".8"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M1 30H8M1 46H8M36 30H43M36 46H43"
        fill="none"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width=".9"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <span
      aria-hidden="true"
      class="relative z-10 mb-[2px] text-[12px] leading-none text-[color:var(--sqc-poc-accent)]"
    >
      ۞
    </span>

    <span
      v-for="line in labelLines"
      :key="line"
      class="relative z-10 block whitespace-nowrap text-[8px] font-semibold leading-[10px]"
    >
      {{ line }}
    </span>

    <span
      class="relative z-10 mt-[2px] block text-[10px] font-bold leading-[11px]"
    >
      {{ marker.numberLabel }}
    </span>
  </div>
</template>
