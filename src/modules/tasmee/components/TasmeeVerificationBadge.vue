<script setup lang="ts">
import { computed } from 'vue'

export type TasmeeVerificationBadgeState =
  | 'self'
  | 'ai-analyzed'
  | 'ai-high-confidence'
  | 'human-verified'

const props = withDefaults(
  defineProps<{
    label?: string
    state?: TasmeeVerificationBadgeState
  }>(),
  {
    label: 'الجلسة محفوظة',
    state: 'self',
  },
)

const stateClasses = computed(() => {
  if (props.state === 'ai-analyzed') {
    return {
      background: 'bg-[var(--sqc-color-verification-aianalyzed-background,#eff6ff)]',
      foreground: 'text-[color:var(--sqc-color-verification-aianalyzed-foreground,#1d4ed8)]',
      dot: 'bg-[var(--sqc-color-verification-aianalyzed-foreground,#1d4ed8)]',
    }
  }

  if (props.state === 'ai-high-confidence') {
    return {
      background: 'bg-[var(--sqc-color-ai-active-background,#f4f6fa)]',
      foreground: 'text-[color:var(--sqc-color-ai-active-foreground,#536f9f)]',
      dot: 'bg-[var(--sqc-color-ai-active-foreground,#536f9f)]',
    }
  }

  if (props.state === 'human-verified') {
    return {
      background: 'bg-[var(--sqc-color-toast-success-background,#f0f8f6)]',
      foreground: 'text-[color:var(--sqc-color-status-success,#237a63)]',
      dot: 'bg-[var(--sqc-color-status-success,#237a63)]',
    }
  }

  return {
    background: 'bg-[var(--sqc-color-verification-self-background)]',
    foreground: 'text-[color:var(--sqc-color-verification-self-foreground)]',
    dot: 'bg-[var(--sqc-color-verification-self-foreground)]',
  }
})
</script>

<template>
  <div
    dir="rtl"
    class="inline-flex items-center gap-[var(--sqc-dimension-spacing-8)] rounded-[var(--sqc-dimension-radius-999)] px-[var(--sqc-dimension-spacing-12)] py-[var(--sqc-dimension-spacing-8)] text-[12px] font-medium leading-[18px] [font-family:var(--sqc-font-family-ui)]"
    :class="[stateClasses.background, stateClasses.foreground]"
  >
    <span
      aria-hidden="true"
      class="size-[8px] shrink-0 rounded-full"
      :class="stateClasses.dot"
    />
    {{ label }}
  </div>
</template>
