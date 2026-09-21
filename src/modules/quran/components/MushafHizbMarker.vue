<script setup lang="ts">
import type { MushafHizbMarker } from '@/modules/quran/data/hizbMarkers'

defineProps<{
  marker: MushafHizbMarker
  side: 'left' | 'right'
}>()
</script>

<template>
  <div
    class="pointer-events-none absolute z-30 flex w-[42px] flex-col items-center justify-center gap-[1px] rounded-[8px] border border-[var(--sqc-poc-accent-border)] bg-[var(--sqc-color-mushaf-paper)] px-[3px] py-[3px] text-center text-[color:var(--sqc-poc-accent-strong)] shadow-[0_1px_3px_rgba(48,59,85,0.08)]"
    :class="
      side === 'left'
        ? 'left-[-20px]'
        : 'right-[-20px]'
    "
  >
    <span
      aria-hidden="true"
      class="mb-[1px] text-[12px] leading-none text-[color:var(--sqc-poc-accent)]"
    >
      ۞
    </span>

    <span class="text-[7px] font-semibold leading-[9px]">
      {{ marker.shortLabel }}
    </span>

    <span class="text-[9px] font-bold leading-[11px]">
      {{ marker.numberLabel }}
    </span>
  </div>
</template>
