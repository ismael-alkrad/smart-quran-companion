<script setup lang="ts">
import { computed } from 'vue'

type ButtonSize = 'small' | 'medium' | 'large'
type ButtonVariant = 'primary' | 'secondary' | 'destructive'
type ButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(
  defineProps<{
    size?: ButtonSize
    variant?: ButtonVariant
    type?: ButtonType
    disabled?: boolean
  }>(),
  {
    size: 'medium',
    variant: 'primary',
    type: 'button',
    disabled: false,
  },
)

const sizeClasses = computed(() => {
  if (props.size === 'large') {
    return [
      'px-[var(--sqc-dimension-spacing-20)]',
      'py-[var(--sqc-dimension-spacing-16)]',
      'text-[length:var(--sqc-typography-title-font-size)]',
      'leading-[var(--sqc-typography-title-line-height)]',
      'font-[var(--sqc-typography-title-font-weight)]',
    ]
  }

  if (props.size === 'small') {
    return [
      'px-[var(--sqc-dimension-spacing-12)]',
      'py-[var(--sqc-dimension-spacing-8)]',
      'text-[length:var(--sqc-typography-label-font-size)]',
      'leading-[var(--sqc-typography-label-line-height)]',
      'font-[var(--sqc-typography-label-font-weight)]',
    ]
  }

  return [
    'px-[var(--sqc-dimension-spacing-16)]',
    'py-[var(--sqc-dimension-spacing-12)]',
    'text-[length:var(--sqc-typography-label-font-size)]',
    'leading-[var(--sqc-typography-label-line-height)]',
    'font-[var(--sqc-typography-label-font-weight)]',
  ]
})

const variantClasses = computed(() => {
  if (props.variant === 'secondary') {
    return [
      'bg-[var(--sqc-color-background-elevated)]',
      'text-[var(--sqc-color-text-brand)]',
      'active:bg-[var(--sqc-color-background-tertiary)]',
    ]
  }

  if (props.variant === 'destructive') {
    return [
      'bg-[var(--sqc-color-action-destructive)]',
      'text-[var(--sqc-color-text-inverse)]',
      'active:bg-[var(--sqc-color-action-destructive)]',
    ]
  }

  return [
    'bg-[var(--sqc-color-action-primary)]',
    'text-[var(--sqc-color-text-inverse)]',
    'active:bg-[var(--sqc-color-action-primarypressed)]',
  ]
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="relative inline-flex items-center justify-center gap-[var(--sqc-dimension-spacing-8)] rounded-[var(--sqc-dimension-radius-12)] text-center whitespace-nowrap [font-family:var(--sqc-font-family-ui)] disabled:cursor-not-allowed disabled:bg-[var(--sqc-color-action-disabled)] disabled:text-[var(--sqc-color-text-disabled)]"
    :class="[sizeClasses, variantClasses]"
  >
    <slot />
  </button>
</template>
