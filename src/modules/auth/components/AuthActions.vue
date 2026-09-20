<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue'
import type {
  AuthActionsSecondarySize,
  AuthActionsVariant,
} from '@/modules/auth/types/actions'

type AuthActionButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(
  defineProps<{
    variant?: AuthActionsVariant
    primaryLabel: string
    secondaryLabel?: string
    secondarySize?: AuthActionsSecondarySize
    primaryType?: AuthActionButtonType
    primaryDisabled?: boolean
    primaryLoading?: boolean
    primaryLoadingText?: string
  }>(),
  {
    variant: 'form',
    secondaryLabel: undefined,
    secondarySize: 'body',
    primaryType: 'button',
    primaryDisabled: false,
    primaryLoading: false,
    primaryLoadingText: undefined,
  },
)

const emit = defineEmits<{
  primary: []
  secondary: []
}>()
</script>

<template>
  <div
    dir="rtl"
    class="flex w-full flex-col items-end [font-family:var(--sqc-font-family-ui)]"
    :class="props.variant === 'welcome' ? 'gap-[10px]' : 'gap-[12px]'"
  >
    <BaseButton
      size="large"
      variant="primary"
      :type="props.primaryType"
      :disabled="props.primaryDisabled"
      :loading="props.primaryLoading"
      :loading-text="props.primaryLoadingText"
      class="w-full"
      @click="emit('primary')"
    >
      {{ props.primaryLabel }}
    </BaseButton>

    <button
      v-if="props.secondaryLabel"
      type="button"
      dir="auto"
      class="w-full bg-transparent p-0 text-right font-normal text-[color:var(--sqc-color-text-brand)] [font-family:var(--sqc-font-family-ui)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sqc-color-border-focus)]"
      :class="props.secondarySize === 'small'
        ? 'text-[12px] leading-[20px]'
        : 'text-[14px] leading-[24px]'"
      @click="emit('secondary')"
    >
      {{ props.secondaryLabel }}
    </button>
  </div>
</template>
