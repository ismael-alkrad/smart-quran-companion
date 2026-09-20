<script setup lang="ts">
import { BaseInput } from '@/shared/components'

const props = withDefaults(
  defineProps<{
    password: string
    confirmation: string
    passwordError?: string
    confirmationError?: string
  }>(),
  {
    passwordError: undefined,
    confirmationError: undefined,
  },
)

const emit = defineEmits<{
  'update:password': [value: string]
  'update:confirmation': [value: string]
}>()
</script>

<template>
  <BaseInput
    :model-value="props.password"
    type="password"
    label="كلمة المرور الجديدة"
    placeholder="••••••••"
    :error="props.passwordError"
    @update:model-value="emit('update:password', $event)"
  />

  <BaseInput
    :model-value="props.confirmation"
    type="password"
    label="تأكيد كلمة المرور"
    placeholder="••••••••"
    :error="props.confirmationError"
    @update:model-value="emit('update:confirmation', $event)"
  />
</template>
