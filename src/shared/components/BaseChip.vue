<script setup lang="ts">
import { Button as FrappeButton } from 'frappe-ui'
import { computed } from 'vue'

export type BaseChipTone = 'neutral' | 'brand' | 'warning'

const props = withDefaults(
  defineProps<{
    label?: string
    selected?: boolean
    tone?: BaseChipTone
    disabled?: boolean
  }>(),
  {
    label: 'اليوم',
    selected: false,
    tone: 'neutral',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:selected': [value: boolean]
  click: [event: MouseEvent]
}>()

const stateClasses = computed(() => {
  if (props.disabled) {
    return [
      '!bg-[var(--sqc-color-action-disabled)]',
      '!text-[color:var(--sqc-color-text-disabled)]',
    ]
  }

  if (props.tone === 'brand') {
    return props.selected
      ? [
          '!bg-[var(--sqc-color-action-primary)]',
          '!text-[color:var(--sqc-color-text-inverse)]',
        ]
      : [
          '!bg-[var(--sqc-color-quranstate-memorizing-background)]',
          '!text-[color:var(--sqc-color-quranstate-memorizing-foreground)]',
        ]
  }

  if (props.tone === 'warning') {
    return props.selected
      ? [
          '!bg-[var(--sqc-color-status-warning)]',
          '!text-[color:var(--sqc-color-text-inverse)]',
        ]
      : [
          '!bg-[var(--sqc-color-potentialissue-hesitation-background)]',
          '!text-[color:var(--sqc-color-potentialissue-hesitation-foreground)]',
        ]
  }

  return props.selected
    ? [
        '!bg-[var(--sqc-color-background-tertiary)]',
        '!text-[color:var(--sqc-color-text-brand)]',
      ]
    : [
        '!bg-[var(--sqc-color-background-elevated)]',
        '!text-[color:var(--sqc-color-text-secondary)]',
      ]
})

function handleClick(event: MouseEvent) {
  if (props.disabled) return

  emit('update:selected', !props.selected)
  emit('click', event)
}
</script>

<template>
  <FrappeButton
    theme="gray"
    variant="ghost"
    type="button"
    :disabled="disabled"
    :label="label"
    :aria-pressed="selected"
    :data-state="selected ? 'active' : 'inactive'"
    class="!h-auto !gap-[var(--sqc-dimension-spacing-8)] !rounded-[var(--sqc-dimension-radius-999)] !px-[var(--sqc-dimension-spacing-12)] !py-[var(--sqc-dimension-spacing-8)] !text-[12px] !font-medium !leading-[18px] [font-family:var(--sqc-font-family-ui)] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[var(--sqc-color-border-focus)]"
    :class="stateClasses"
    @click="handleClick"
  />
</template>
