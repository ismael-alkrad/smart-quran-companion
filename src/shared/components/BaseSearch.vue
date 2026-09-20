<script setup lang="ts">
import {
  TextInput as FrappeTextInput,
  type TextInputExposed,
} from 'frappe-ui'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    debounce?: number
    ariaLabel?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'ابحث في السور',
    disabled: false,
    debounce: undefined,
    ariaLabel: undefined,
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
  <FrappeTextInput
    ref="inputRef"
    type="text"
    size="lg"
    variant="outline"
    role="searchbox"
    enterkeyhint="search"
    :aria-label="ariaLabel ?? placeholder"
    :model-value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :debounce="props.debounce"
    class="!w-full [font-family:var(--sqc-font-family-ui)] [&_input[data-slot=control]]:!h-[48px] [&_input[data-slot=control]]:!rounded-[var(--sqc-dimension-radius-12)] [&_input[data-slot=control]]:!border [&_input[data-slot=control]]:!border-[var(--sqc-color-border-default)] [&_input[data-slot=control]]:!bg-[var(--sqc-color-background-elevated)] [&_input[data-slot=control]]:!text-[14px] [&_input[data-slot=control]]:!font-normal [&_input[data-slot=control]]:!leading-[24px] [&_input[data-slot=control]]:!text-[color:var(--sqc-color-text-primary)] [&_input[data-slot=control]]:placeholder:!text-[color:var(--sqc-color-text-tertiary)] [&_input[data-slot=control]]:focus:!border-[var(--sqc-color-border-focus)] [&_input[data-slot=control]]:focus:!shadow-none [&_input[data-slot=control]]:focus:!ring-0 [&_input[data-slot=control][data-disabled=true]]:!border-[var(--sqc-color-border-default)] [&_input[data-slot=control][data-disabled=true]]:!bg-[var(--sqc-color-background-subtle)] [&_input[data-slot=control][data-disabled=true]]:!text-[color:var(--sqc-color-text-disabled)] [&_input[data-slot=control][data-disabled=true]]:placeholder:!text-[color:var(--sqc-color-text-disabled)]"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #prefix>
      <span
        aria-hidden="true"
        class="block size-[18px] shrink-0 bg-[var(--sqc-color-text-tertiary)] [mask-image:url('/assets/icons/search-18.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/search-18.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
      />
    </template>
  </FrappeTextInput>
</template>
