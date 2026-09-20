<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseInput } from '@/shared/components'

const props = withDefaults(
  defineProps<{
    email: string
    password: string
    passwordError?: string
    autofocusPassword?: boolean
  }>(),
  {
    passwordError: undefined,
    autofocusPassword: false,
  },
)

const emit = defineEmits<{
  'update:email': [value: string]
  'update:password': [value: string]
}>()

const passwordInput = ref<InstanceType<typeof BaseInput> | null>(null)

onMounted(() => {
  if (props.autofocusPassword) {
    passwordInput.value?.focus()
  }
})
</script>

<template>
  <BaseInput
    :model-value="props.email"
    type="email"
    label="البريد الإلكتروني"
    placeholder="name@example.com"
    @update:model-value="emit('update:email', $event)"
  />

  <BaseInput
    ref="passwordInput"
    :model-value="props.password"
    type="password"
    label="كلمة المرور"
    placeholder="••••••••"
    :error="props.passwordError"
    @update:model-value="emit('update:password', $event)"
  />
</template>
