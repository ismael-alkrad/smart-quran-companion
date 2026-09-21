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
    class="pointer-events-none absolute z-40 flex min-h-[48px] w-[26px] flex-col items-center justify-center px-[1px] py-[3px] text-center text-[color:var(--sqc-poc-accent-strong)]"
    :class="
      side === 'left'
        ? 'left-[5px]'
        : 'right-[5px]'
    "
  >
    <svg
      viewBox="0 0 30 58"
      preserveAspectRatio="none"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path
        d="M15 1 20 5H25C27.8 5 29 7 29 10V48C29 51 27.8 53 25 53H20L15 57 10 53H5C2.2 53 1 51 1 48V10C1 7 2.2 5 5 5H10Z"
        fill="var(--sqc-color-mushaf-paper)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width=".9"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M15 5 18 8 15 11 12 8ZM15 47 18 50 15 53 12 50Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width=".7"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M4 16H26M4 43H26"
        fill="none"
        stroke="var(--sqc-poc-accent-soft)"
        stroke-width=".7"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <span
      v-for="line in labelLines"
      :key="line"
      class="relative z-10 block whitespace-nowrap text-[6px] font-semibold leading-[7px]"
    >
      {{ line }}
    </span>

    <span
      class="relative z-10 mt-[1px] block text-[8px] font-bold leading-[9px]"
    >
      {{ marker.numberLabel }}
    </span>
  </div>
</template>
