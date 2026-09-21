<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    seconds?: number
    active?: boolean
  }>(),
  {
    seconds: 0,
    active: false,
  },
)

const formattedTime = computed(() => {
  const total = Math.max(0, Math.trunc(props.seconds))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
</script>

<template>
  <div
    dir="ltr"
    class="inline-flex items-center gap-[var(--sqc-dimension-spacing-8)] rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-background-subtle)] px-[var(--sqc-dimension-spacing-12)] py-[var(--sqc-dimension-spacing-8)] [font-family:var(--sqc-font-family-ui)]"
  >
    <span
      class="text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-primary)]"
    >
      {{ formattedTime }}
    </span>

    <span
      aria-hidden="true"
      class="size-[7px] shrink-0 rounded-full"
      :class="
        active
          ? 'bg-[var(--sqc-color-action-destructive)]'
          : 'bg-[var(--sqc-color-text-tertiary)]'
      "
    />
  </div>
</template>
