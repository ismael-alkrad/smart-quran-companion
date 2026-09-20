<script setup lang="ts">
import { Button as FrappeButton } from 'frappe-ui'
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
    loading?: boolean
    loadingText?: string
  }>(),
  {
    size: 'medium',
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
    loadingText: undefined,
  },
)

const sizeClasses = computed(() => {
  if (props.size === 'large') {
    return [
      '!h-auto',
      '!px-[var(--sqc-dimension-spacing-20)]',
      '!py-[var(--sqc-dimension-spacing-16)]',
      '!text-[16px]',
      '!leading-[26px]',
      '!font-semibold',
    ]
  }

  if (props.size === 'small') {
    return [
      '!h-auto',
      '!px-[var(--sqc-dimension-spacing-12)]',
      '!py-[var(--sqc-dimension-spacing-8)]',
      '!text-[12px]',
      '!leading-[18px]',
      '!font-medium',
    ]
  }

  return [
    '!h-auto',
    '!px-[var(--sqc-dimension-spacing-16)]',
    '!py-[var(--sqc-dimension-spacing-12)]',
    '!text-[12px]',
    '!leading-[18px]',
    '!font-medium',
  ]
})

const variantClasses = computed(() => {
  if (props.disabled) {
    return [
      '!bg-[var(--sqc-color-action-disabled)]',
      '!text-[color:var(--sqc-color-text-disabled)]',
    ]
  }

  if (props.variant === 'secondary') {
    return [
      '!bg-[var(--sqc-color-background-elevated)]',
      '!text-[color:var(--sqc-color-text-brand)]',
      'active:!bg-[var(--sqc-color-background-tertiary)]',
    ]
  }

  if (props.variant === 'destructive') {
    return [
      '!bg-[var(--sqc-color-action-destructive)]',
      '!text-[color:var(--sqc-color-text-inverse)]',
      'active:!bg-[var(--sqc-color-action-destructive)]',
    ]
  }

  return [
    '!bg-[var(--sqc-color-action-primary)]',
    '!text-[color:var(--sqc-color-text-inverse)]',
    'active:!bg-[var(--sqc-color-action-primarypressed)]',
  ]
})
</script>

<template>
  <FrappeButton
    theme="gray"
    variant="ghost"
    :type="type"
    :disabled="disabled"
    :loading="loading"
    :loading-text="loadingText"
    class="!gap-[var(--sqc-dimension-spacing-8)] !rounded-[var(--sqc-dimension-radius-12)] [font-family:var(--sqc-font-family-ui)] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[var(--sqc-color-border-focus)]"
    :class="[sizeClasses, variantClasses]"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>

    <slot />

    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </FrappeButton>
</template>
