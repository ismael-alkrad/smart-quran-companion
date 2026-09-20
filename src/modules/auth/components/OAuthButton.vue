<script setup lang="ts">
import { Button as FrappeButton } from 'frappe-ui'
import { computed } from 'vue'

import type { OAuthProvider } from '@/modules/auth/types/oauth'

type OAuthButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(
  defineProps<{
    provider?: OAuthProvider
    label?: string
    type?: OAuthButtonType
    disabled?: boolean
  }>(),
  {
    provider: 'google',
    label: undefined,
    type: 'button',
    disabled: false,
  },
)

const providerConfig = computed(() => {
  if (props.provider === 'apple') {
    return {
      label: 'المتابعة باستخدام Apple',
      icon: '/assets/auth/apple-provider-mark-24.svg',
    }
  }

  return {
    label: 'المتابعة باستخدام Google',
    icon: '/assets/auth/google-provider-mark-24.svg',
  }
})

const buttonLabel = computed(() => props.label ?? providerConfig.value.label)
</script>

<template>
  <FrappeButton
    theme="gray"
    variant="ghost"
    size="lg"
    :type="type"
    :disabled="disabled"
    :label="buttonLabel"
    dir="rtl"
    class="!h-[58px] !w-full !gap-[12px] !rounded-[16px] !bg-[var(--sqc-color-background-secondary)] !px-[16px] !py-[8px] !text-[16px] !font-semibold !leading-[26px] !text-[color:var(--sqc-color-text-primary)] [font-family:var(--sqc-font-family-ui)] hover:!bg-[var(--sqc-color-background-secondary)] active:!bg-[var(--sqc-color-background-secondary)] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[var(--sqc-color-border-focus)]"
  >
    <template #prefix>
      <span class="relative block size-[24px] shrink-0" aria-hidden="true">
        <img
          :src="providerConfig.icon"
          alt=""
          class="absolute inset-0 block size-full max-w-none"
        />
      </span>
    </template>

    <template #suffix>
      <span class="block h-[28px] w-[24px] shrink-0" aria-hidden="true" />
    </template>
  </FrappeButton>
</template>
