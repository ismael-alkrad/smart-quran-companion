<script setup lang="ts">
import { computed } from 'vue'

export type TasmeeStateHeaderState =
  | 'preparing'
  | 'mic-check'
  | 'ready'
  | 'listening'
  | 'paused'
  | 'session-ended'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    state?: TasmeeStateHeaderState
  }>(),
  {
    title: 'حالة الجلسة',
    subtitle: 'تفاصيل الحالة',
    state: 'preparing',
  },
)

const stateClasses = computed(() => {
  if (props.state === 'mic-check') {
    return {
      background: 'bg-[var(--sqc-color-ai-analyzing-background)]',
      dot: 'bg-[var(--sqc-color-ai-analyzing-foreground)]',
    }
  }

  if (props.state === 'ready' || props.state === 'listening') {
    return {
      background: 'bg-[var(--sqc-color-ai-active-background)]',
      dot: 'bg-[var(--sqc-color-ai-active-foreground)]',
    }
  }

  if (props.state === 'paused') {
    return {
      background: 'bg-[var(--sqc-color-potentialissue-hesitation-background)]',
      dot: 'bg-[var(--sqc-color-potentialissue-hesitation-foreground)]',
    }
  }

  return {
    background: 'bg-[var(--sqc-color-background-subtle)]',
    dot: 'bg-[var(--sqc-color-text-secondary)]',
  }
})
</script>

<template>
  <section
    dir="rtl"
    class="flex w-full items-center gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] px-[var(--sqc-dimension-spacing-16)] py-[var(--sqc-dimension-spacing-12)] [font-family:var(--sqc-font-family-ui)]"
    :class="stateClasses.background"
  >
    <div class="flex min-w-0 flex-1 flex-col items-end gap-[6px] overflow-hidden text-right">
      <h2 class="w-full text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]">
        {{ title }}
      </h2>

      <p class="w-full text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]">
        {{ subtitle }}
      </p>
    </div>

    <span
      aria-hidden="true"
      class="size-[10px] shrink-0 rounded-full"
      :class="stateClasses.dot"
    />
  </section>
</template>
