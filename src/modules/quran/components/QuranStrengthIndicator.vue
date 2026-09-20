<script setup lang="ts">
import { computed } from 'vue'

import type { HifzStrength } from '@/modules/quran/api'

export type QuranStrengthKind = 'memory' | 'transition'

const props = withDefaults(
  defineProps<{
    kind?: QuranStrengthKind
    level?: HifzStrength | null
  }>(),
  {
    kind: 'memory',
    level: null,
  },
)

const title = computed(() =>
  props.kind === 'transition' ? 'قوة الانتقال' : 'قوة الحفظ',
)

const label = computed(() => {
  switch (props.level) {
    case 'weak':
      return 'ضعيفة'
    case 'developing':
      return 'تتطور'
    case 'strong':
      return 'قوية'
    case 'mastered':
      return 'متقنة'
    default:
      return 'غير مقاسة'
  }
})

const filledSegments = computed(() => {
  switch (props.level) {
    case 'weak':
      return 1
    case 'developing':
      return 2
    case 'strong':
      return 3
    case 'mastered':
      return 4
    default:
      return 0
  }
})

const foregroundClass = computed(() => {
  if (props.level === 'mastered') {
    return 'text-[color:var(--sqc-color-quranstate-mastered-foreground)]'
  }

  if (props.level === 'strong') {
    return 'text-[color:var(--sqc-color-status-success)]'
  }

  if (props.level === 'developing') {
    return 'text-[color:var(--sqc-color-status-warning)]'
  }

  if (props.level === 'weak' && props.kind === 'transition') {
    return 'text-[color:var(--sqc-color-potentialissue-transition-foreground)]'
  }

  if (props.level === 'weak') {
    return 'text-[color:var(--sqc-color-status-error)]'
  }

  return 'text-[color:var(--sqc-color-text-tertiary)]'
})

const segmentClass = computed(() => {
  if (props.level === 'mastered') {
    return 'bg-[var(--sqc-color-quranstate-mastered-foreground)]'
  }

  if (props.level === 'strong') {
    return 'bg-[var(--sqc-color-status-success)]'
  }

  if (props.level === 'developing') {
    return 'bg-[var(--sqc-color-status-warning)]'
  }

  if (props.level === 'weak' && props.kind === 'transition') {
    return 'bg-[var(--sqc-color-potentialissue-transition-foreground)]'
  }

  if (props.level === 'weak') {
    return 'bg-[var(--sqc-color-status-error)]'
  }

  return 'bg-[var(--sqc-color-background-subtle)]'
})
</script>

<template>
  <div
    dir="rtl"
    class="flex h-[64px] w-full flex-col items-start gap-[var(--sqc-dimension-spacing-8)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      dir="rtl"
      class="flex h-[22px] w-full items-center justify-between overflow-hidden text-right text-[12px] font-medium leading-[18px]"
    >
      <span
        dir="rtl"
        class="shrink-0 text-[color:var(--sqc-color-text-secondary)]"
      >
        {{ title }}
      </span>

      <span
        dir="rtl"
        class="shrink-0"
        :class="foregroundClass"
      >
        {{ label }}
      </span>
    </div>

    <div
      dir="rtl"
      class="flex h-[10px] w-full items-start gap-[6px] overflow-hidden"
      :aria-label="title + ': ' + label"
    >
      <span
        v-for="segment in 4"
        :key="segment"
        aria-hidden="true"
        class="h-[8px] min-w-0 flex-1 rounded-[var(--sqc-dimension-radius-999)]"
        :class="
          segment <= filledSegments
            ? segmentClass
            : 'bg-[var(--sqc-color-background-subtle)]'
        "
      />
    </div>
  </div>
</template>
