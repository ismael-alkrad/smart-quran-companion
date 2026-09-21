<script setup lang="ts">
import { computed } from 'vue'

export type TasmeeWaveformState = 'listening' | 'paused' | 'idle'

const props = withDefaults(
  defineProps<{
    levels?: number[]
    state?: TasmeeWaveformState
  }>(),
  {
    levels: () => [0.18, 0.52, 0.3, 0.68, 0.42, 0.82, 0.34, 0.58, 0.22],
    state: 'idle',
  },
)

const bars = computed(() => {
  if (props.state === 'paused') {
    return [0.06, 0.16, 0.1, 0.2, 0.1, 0.16, 0.06, 0.1, 0.06]
  }

  return Array.from({ length: 9 }, (_, index) => {
    const value = props.levels[index] ?? 0.12
    return Math.min(1, Math.max(0.08, value))
  })
})

const barClass = computed(() =>
  props.state === 'paused'
    ? 'bg-[var(--sqc-color-status-warning)]'
    : 'bg-[var(--sqc-color-action-primary)]',
)

function barHeight(level: number) {
  return Math.round(8 + (level * 36))
}
</script>

<template>
  <div
    aria-hidden="true"
    class="flex h-[64px] w-full items-center justify-center gap-[var(--sqc-dimension-spacing-8)]"
  >
    <span
      v-for="(level, index) in bars"
      :key="index"
      class="w-[4px] shrink-0 rounded-[var(--sqc-dimension-radius-999)] transition-[height] duration-100"
      :class="barClass"
      :style="{ height: `${barHeight(level)}px` }"
    />
  </div>
</template>
