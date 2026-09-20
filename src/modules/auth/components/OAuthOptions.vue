<script setup lang="ts">
import OAuthButton from '@/modules/auth/components/OAuthButton.vue'
import OAuthDivider from '@/modules/auth/components/OAuthDivider.vue'
import type { OAuthProvider } from '@/modules/auth/types/oauth'

withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  select: [provider: OAuthProvider]
}>()
</script>

<template>
  <div
    class="flex w-[358px] max-w-full flex-col items-start gap-[10px]"
    dir="rtl"
  >
    <OAuthButton
      provider="google"
      :disabled="disabled"
      @click="emit('select', 'google')"
    />

    <OAuthButton
      provider="apple"
      :disabled="disabled"
      @click="emit('select', 'apple')"
    />

    <OAuthDivider />
  </div>
</template>
