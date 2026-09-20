<script setup lang="ts">
import { computed } from 'vue'

import { BaseProgressBar } from '@/shared/components'

export type QuranProgressState = 'on-track' | 'needs-review'

const props = withDefaults(
  defineProps<{
    title?: string
    meta?: string
    state?: QuranProgressState
    value?: number
  }>(),
  {
    title: 'التقدم في الحفظ',
    meta: '48 صفحة محفوظة',
    state: 'on-track',
    value: 75,
  },
)

const statusLabel = computed(() =>
  props.state === 'needs-review'
    ? 'هناك أجزاء تحتاج مراجعة'
    : 'أنت على المسار',
)

const statusClass = computed(() =>
  props.state === 'needs-review'
    ? 'text-[color:var(--sqc-color-status-warning)]'
    : 'text-[color:var(--sqc-color-status-success)]',
)
</script>

<template>
  <section
    dir="rtl"
    class="flex h-[168px] w-full flex-col items-start gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-16)] bg-[var(--sqc-color-background-elevated)] p-[var(--sqc-dimension-spacing-20)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      dir="ltr"
      class="flex h-[28px] w-full shrink-0 items-center justify-between overflow-hidden"
    >
      <span
        dir="rtl"
        class="shrink-0 whitespace-nowrap text-[12px] font-medium leading-[18px]"
        :class="statusClass"
      >
        {{ statusLabel }}
      </span>

      <h3
        dir="rtl"
        class="shrink-0 whitespace-nowrap text-right text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
      >
        {{ title }}
      </h3>
    </div>

    <p
      dir="auto"
      class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
    >
      {{ meta }}
    </p>

    <BaseProgressBar :value="value" />
  </section>
</template>
