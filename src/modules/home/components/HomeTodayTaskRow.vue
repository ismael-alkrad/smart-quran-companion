<script setup lang="ts">
import { computed } from 'vue'
import type {
  HomeTodayTaskState,
  HomeTodayTaskType,
} from '@/modules/home/types'

const props = withDefaults(
  defineProps<{
    type?: HomeTodayTaskType
    state?: HomeTodayTaskState
  }>(),
  {
    type: 'wird',
    state: 'pending',
  },
)

const title = computed(() => {
  if (props.type === 'hifz') return 'حفظ جديد'
  if (props.type === 'murajaah') return 'مراجعة'
  return 'ورد اليوم'
})

const stateLabel = computed(() => {
  if (props.state === 'done') return 'مكتمل'
  if (props.state === 'active') return 'قيد التنفيذ'
  return 'لم يبدأ'
})

const surfaceClass = computed(() =>
  props.state === 'active'
    ? 'bg-[var(--sqc-color-background-subtle)]'
    : 'bg-[var(--sqc-color-background-secondary)]',
)

const dotClass = computed(() => {
  if (props.state === 'done') return 'bg-[var(--sqc-color-status-success)]'
  if (props.state === 'active') return 'bg-[var(--sqc-color-text-brand)]'
  return 'bg-[var(--sqc-color-text-tertiary)]'
})
</script>

<template>
  <div
    dir="rtl"
    class="flex h-[64px] w-full items-center justify-between rounded-[var(--sqc-dimension-radius-16)] px-[var(--sqc-dimension-spacing-16)] py-[10px] [font-family:var(--sqc-font-family-ui)]"
    :class="surfaceClass"
  >
    <div class="flex shrink-0 flex-col items-start gap-[2px] overflow-hidden text-right">
      <p
        dir="rtl"
        class="whitespace-nowrap text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
      >
        {{ title }}
      </p>

      <p
        dir="rtl"
        class="whitespace-nowrap text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
      >
        {{ stateLabel }}
      </p>
    </div>

    <span
      aria-hidden="true"
      class="size-[8px] shrink-0 rounded-full"
      :class="dotClass"
    />
  </div>
</template>
