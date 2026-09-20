<script setup lang="ts">
import {
  TextInput as FrappeTextInput,
  type TextInputExposed,
  type TextInputProps,
} from 'frappe-ui'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    helper?: string
    error?: TextInputProps['error']
    placeholder?: string
    type?: TextInputProps['type']
    id?: string
    required?: boolean
    disabled?: boolean
    debounce?: number
  }>(),
  {
    modelValue: '',
    label: undefined,
    helper: undefined,
    error: undefined,
    placeholder: undefined,
    type: 'text',
    id: undefined,
    required: false,
    disabled: false,
    debounce: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<TextInputExposed | null>(null)

function focus(options?: FocusOptions) {
  inputRef.value?.focus(options)
}

defineExpose({
  focus,
  get inputElement() {
    return inputRef.value?.inputElement ?? null
  },
})
</script>

<template>
  <div
    class="w-full [font-family:var(--sqc-font-family-ui)] [&_[data-slot=label]]:!text-[12px] [&_[data-slot=label]]:!font-medium [&_[data-slot=label]]:!leading-[18px] [&_[data-slot=label]]:!text-[color:var(--sqc-color-text-primary)] [&_[data-slot=description]]:!text-[12px] [&_[data-slot=description]]:!font-normal [&_[data-slot=description]]:!leading-[20px] [&_[data-slot=description]]:!text-[color:var(--sqc-color-text-tertiary)] [&_[data-slot=error]]:!text-[12px] [&_[data-slot=error]]:!font-normal [&_[data-slot=error]]:!leading-[20px] [&_[data-slot=error]]:!text-[color:var(--sqc-color-status-error)] [&_input[data-slot=control]]:!h-[48px] [&_input[data-slot=control]]:!rounded-[var(--sqc-dimension-radius-12)] [&_input[data-slot=control]]:!border [&_input[data-slot=control]]:!border-[var(--sqc-color-border-default)] [&_input[data-slot=control]]:!bg-[var(--sqc-color-background-elevated)] [&_input[data-slot=control]]:!px-[14px] [&_input[data-slot=control]]:!py-0 [&_input[data-slot=control]]:!text-[14px] [&_input[data-slot=control]]:!font-normal [&_input[data-slot=control]]:!leading-[24px] [&_input[data-slot=control]]:!text-[color:var(--sqc-color-text-primary)] [&_input[data-slot=control]]:placeholder:!text-[color:var(--sqc-color-text-secondary)] [&_input[data-slot=control]]:focus:!border-[var(--sqc-color-border-focus)] [&_input[data-slot=control]]:focus:!shadow-none [&_input[data-slot=control]]:focus:!ring-0 [&_input[data-slot=control][data-state=invalid]]:!border-[var(--sqc-color-status-error)] [&_input[data-slot=control][data-disabled=true]]:!border-[var(--sqc-color-border-default)] [&_input[data-slot=control][data-disabled=true]]:!bg-[var(--sqc-color-background-subtle)] [&_input[data-slot=control][data-disabled=true]]:!text-[color:var(--sqc-color-text-disabled)] [&_input[data-slot=control][data-disabled=true]]:placeholder:!text-[color:var(--sqc-color-text-disabled)]"
    :class="disabled ? '[&_[data-slot=label]]:!text-[color:var(--sqc-color-text-disabled)]' : ''"
  >
    <FrappeTextInput
      ref="inputRef"
      class="!w-full !space-y-[var(--sqc-dimension-spacing-8)]"
      size="lg"
      variant="outline"
      :model-value="props.modelValue"
      :label="props.label"
      :description="props.helper"
      :error="props.error"
      :placeholder="props.placeholder"
      :type="props.type"
      :id="props.id"
      :required="props.required"
      :disabled="props.disabled"
      :debounce="props.debounce"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <template v-if="$slots.prefix" #prefix>
        <slot name="prefix" />
      </template>

      <template v-if="$slots.suffix" #suffix>
        <slot name="suffix" />
      </template>

      <template v-if="$slots.label" #label="slotProps">
        <slot name="label" v-bind="slotProps" />
      </template>

      <template v-if="$slots.description" #description>
        <slot name="description" />
      </template>
    </FrappeTextInput>
  </div>
</template>
