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
    class="pointer-events-none absolute z-40 flex min-h-[58px] w-[36px] flex-col items-center justify-center bg-[var(--sqc-color-mushaf-paper)] px-[2px] py-[4px] text-center text-[color:var(--sqc-poc-accent-strong)]"
    :class="
      side === 'left'
        ? 'left-[-23px]'
        : 'right-[-23px]'
    "
  >
    <svg
      viewBox="0 0 40 72"
      preserveAspectRatio="none"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path
        d="M20 1 27 7H34C37 7 39 9 39 12V60C39 63 37 65 34 65H27L20 71 13 65H6C3 65 1 63 1 60V12C1 9 3 7 6 7H13Z"
        fill="var(--sqc-color-mushaf-paper)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.1"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M20 7 24 11 20 15 16 11ZM20 57 24 61 20 65 16 61Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width=".8"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M6 17H34M6 55H34"
        fill="none"
        stroke="var(--sqc-poc-accent-soft)"
        stroke-width=".8"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <span
      aria-hidden="true"
      class="relative z-10 mb-[2px] text-[11px] leading-none text-[color:var(--sqc-poc-accent)]"
    >
      ۞
    </span>

    <span
      v-for="line in labelLines"
      :key="line"
      class="relative z-10 block text-[7px] font-semibold leading-[9px]"
    >
      {{ line }}
    </span>

    <span
      class="relative z-10 mt-[1px] block text-[9px] font-bold leading-[11px]"
    >
      {{ marker.numberLabel }}
    </span>
  </div>
</template>
