<script setup lang="ts">
import { Badge as FrappeBadge, type BadgeProps } from 'frappe-ui'
import { computed } from 'vue'

export type BaseBadgeTone =
  | 'neutral'
  | 'brand'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'

const props = withDefaults(
  defineProps<{
    label?: BadgeProps['label']
    tone?: BaseBadgeTone
  }>(),
  {
    label: undefined,
    tone: 'neutral',
  },
)

const toneClasses = computed(() => {
  switch (props.tone) {
    case 'brand':
      return [
        '!bg-[var(--sqc-color-quranstate-memorizing-background)]',
        '!text-[color:var(--sqc-color-quranstate-memorizing-foreground)]',
      ]
    case 'info':
      return [
        '!bg-[var(--sqc-color-ai-analyzing-background)]',
        '!text-[color:var(--sqc-color-ai-analyzing-foreground)]',
      ]
    case 'warning':
      return [
        '!bg-[var(--sqc-color-potential-issue-hesitation-background)]',
        '!text-[color:var(--sqc-color-potential-issue-hesitation-foreground)]',
      ]
    case 'error':
      return [
        '!bg-[var(--sqc-color-potential-issue-substitution-background)]',
        '!text-[color:var(--sqc-color-potential-issue-substitution-foreground)]',
      ]
    case 'success':
      return [
        '!bg-[var(--sqc-color-quranstate-approved-background)]',
        '!text-[color:var(--sqc-color-quranstate-approved-foreground)]',
      ]
    default:
      return [
        '!bg-[var(--sqc-color-background-subtle)]',
        '!text-[color:var(--sqc-color-text-secondary)]',
      ]
  }
})
</script>

<template>
  <FrappeBadge
    theme="gray"
    variant="ghost"
    size="md"
    :label="label"
    class="!h-auto !gap-1 !rounded-[var(--sqc-dimension-radius-999)] !px-[var(--sqc-dimension-spacing-8)] !py-[var(--sqc-dimension-spacing-4)] !text-[12px] !font-medium !leading-[18px] !tracking-normal [font-family:var(--sqc-font-family-ui)]"
    :class="toneClasses"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>

    <slot>{{ label }}</slot>

    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </FrappeBadge>
</template>
