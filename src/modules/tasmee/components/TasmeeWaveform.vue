<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    levels?: number[]
  }>(),
  {
    levels: () => [0.18, 0.52, 0.3, 0.68, 0.42, 0.82, 0.34, 0.58, 0.22],
  },
)

const bars = computed(() =>
  Array.from({ length: 9 }, (_, index) => {
    const value = props.levels[index] ?? 0.12
    return Math.min(1, Math.max(0.08, value))
  }),
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
      class="w-[4px] shrink-0 rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-action-primary)] transition-[height] duration-100"
      :style="{ height: `${barHeight(level)}px` }"
    />
  </div>
</template>
