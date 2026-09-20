<script setup lang="ts">
import { Button as FrappeButton, type ButtonProps } from 'frappe-ui'
import { computed } from 'vue'

type IconButtonSize = 'small' | 'medium' | 'large'
type IconButtonVariant = 'primary' | 'secondary'
type ButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(
  defineProps<{
    label: string
    icon?: ButtonProps['icon']
    size?: IconButtonSize
    variant?: IconButtonVariant
    type?: ButtonType
    disabled?: boolean
    loading?: boolean
    tooltip?: string
  }>(),
  {
    icon: 'lucide-plus',
    size: 'medium',
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
    tooltip: undefined,
  },
)

const frappeSize = computed<ButtonProps['size']>(() => {
  if (props.size === 'large') return 'md'
  if (props.size === 'small') return 'xs'
  return 'sm'
})

const sizeClasses = computed(() => {
  if (props.size === 'large') return ['!h-[52px]', '!w-[52px]']
  if (props.size === 'small') return ['!h-[36px]', '!w-[36px]']
  return ['!h-[44px]', '!w-[44px]']
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
    :size="frappeSize"
    :type="type"
    :label="label"
    :icon="icon"
    :disabled="disabled"
    :loading="loading"
    :tooltip="tooltip"
    class="!shrink-0 !rounded-[var(--sqc-dimension-radius-999)] !p-0 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[var(--sqc-color-border-focus)]"
    :class="[sizeClasses, variantClasses]"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </FrappeButton>
</template>
