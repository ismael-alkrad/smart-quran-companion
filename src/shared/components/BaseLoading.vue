<script setup lang="ts">
import { Skeleton as FrappeSkeleton } from 'frappe-ui'

export type BaseLoadingStyle = 'spinner' | 'skeleton'

withDefaults(
  defineProps<{
    label?: string
    style?: BaseLoadingStyle
  }>(),
  {
    label: 'جاري التحميل',
    style: 'spinner',
  },
)
</script>

<template>
  <div
    v-if="style === 'spinner'"
    role="status"
    aria-live="polite"
    dir="rtl"
    class="flex h-[112px] w-[160px] flex-col items-center justify-center gap-[var(--sqc-dimension-spacing-12)] [font-family:var(--sqc-font-family-ui)]"
  >
    <img
      src="/assets/loading/loading-spinner-32.svg"
      alt=""
      aria-hidden="true"
      class="size-[32px] shrink-0 animate-spin motion-reduce:animate-none"
    />

    <span
      dir="auto"
      class="shrink-0 whitespace-nowrap text-right text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-secondary)]"
    >
      {{ label }}
    </span>
  </div>

  <div
    v-else
    aria-hidden="true"
    class="flex h-[120px] w-[342px] max-w-full flex-col items-start gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-secondary)] p-[var(--sqc-dimension-spacing-16)]"
  >
    <FrappeSkeleton
      class="!h-[18px] !w-[220px] !max-w-full !rounded-[var(--sqc-dimension-radius-999)] !bg-[var(--sqc-color-background-subtle)]"
    />
    <FrappeSkeleton
      class="!h-[12px] !w-[300px] !max-w-full !rounded-[var(--sqc-dimension-radius-999)] !bg-[var(--sqc-color-background-subtle)]"
    />
    <FrappeSkeleton
      class="!h-[12px] !w-[180px] !max-w-full !rounded-[var(--sqc-dimension-radius-999)] !bg-[var(--sqc-color-background-subtle)]"
    />
  </div>
</template>
