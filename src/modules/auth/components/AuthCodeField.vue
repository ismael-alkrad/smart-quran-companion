<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseInput } from '@/shared/components'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    helper?: string
    error?: string
    placeholder?: string
    autofocus?: boolean
  }>(),
  {
    modelValue: '',
    label: 'رمز التحقق',
    helper: undefined,
    error: undefined,
    placeholder: '— — — — — —',
    autofocus: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)

onMounted(() => {
  if (props.autofocus) {
    inputRef.value?.focus()
  }
})
</script>

<template>
  <BaseInput
    ref="inputRef"
    :model-value="props.modelValue"
    :label="props.label"
    :helper="props.helper"
    :error="props.error"
    :placeholder="props.placeholder"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
