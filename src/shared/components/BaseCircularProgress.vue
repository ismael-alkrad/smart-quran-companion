<script setup lang="ts">
import { computed } from 'vue'

const RADIUS = 33
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const props = withDefaults(
  defineProps<{
    value?: number
  }>(),
  {
    value: 0,
  },
)

const normalizedValue = computed(() =>
  Math.min(100, Math.max(0, Number.isFinite(props.value) ? props.value : 0)),
)

const dashOffset = computed(
  () => CIRCUMFERENCE * (1 - normalizedValue.value / 100),
)

const valueLabel = computed(() => `${Math.round(normalizedValue.value)}%`)
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="normalizedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="valueLabel"
    class="relative size-[72px] shrink-0"
  >
    <svg
      viewBox="0 0 72 72"
      aria-hidden="true"
      class="absolute inset-0 size-[72px] -rotate-90"
    >
      <circle
        cx="36"
        cy="36"
        :r="RADIUS"
        fill="none"
        stroke="currentColor"
        stroke-width="6"
        class="text-[color:var(--sqc-color-border-subtle)]"
      />

      <circle
        cx="36"
        cy="36"
        :r="RADIUS"
        fill="none"
        stroke="currentColor"
        stroke-width="6"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
        class="text-[color:var(--sqc-color-action-primary)]"
      />
    </svg>

    <span
      dir="auto"
      class="absolute inset-0 flex items-center justify-center whitespace-nowrap text-center text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-primary)] [font-family:var(--sqc-font-family-ui)]"
    >
      {{ valueLabel }}
    </span>
  </div>
</template>
