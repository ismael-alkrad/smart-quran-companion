<script setup lang="ts">
import {
  TabButtons as FrappeTabButtons,
  type TabButtonValue,
} from 'frappe-ui'
import { computed } from 'vue'

export interface BaseSegmentedOption {
  value: TabButtonValue
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: TabButtonValue
    options?: BaseSegmentedOption[]
    ariaLabel?: string
  }>(),
  {
    modelValue: undefined,
    options: () => [
      { value: '1', label: 'اليوم' },
      { value: '2', label: 'الأسبوع' },
    ],
    ariaLabel: 'خيارات العرض',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: TabButtonValue]
}>()

const visibleOptions = computed(() => props.options.slice(0, 3))
</script>

<template>
  <FrappeTabButtons
    :model-value="props.modelValue"
    :options="visibleOptions"
    variant="subtle"
    size="sm"
    fluid
    dir="rtl"
    :aria-label="ariaLabel"
    class="!flex !h-[44px] !w-full !items-center !gap-[var(--sqc-dimension-spacing-4)] !rounded-[var(--sqc-dimension-radius-12)] !bg-[var(--sqc-color-background-subtle)] !p-[var(--sqc-dimension-spacing-4)] [font-family:var(--sqc-font-family-ui)] [&_[data-slot=tab-indicator]]:!rounded-[var(--sqc-dimension-radius-8)] [&_[data-slot=tab-indicator]]:!bg-[var(--sqc-color-background-elevated)] [&_[data-slot=tab-indicator]]:!shadow-none [&_[data-slot=tab-button]]:!min-w-0 [&_[data-slot=tab-button]]:!flex-1 [&_[data-slot=tab-button]]:!rounded-[var(--sqc-dimension-radius-8)] [&_[data-slot=tab-button]>span]:!h-[36px] [&_[data-slot=tab-button]>span]:!w-full [&_[data-slot=tab-button]>span]:!rounded-[var(--sqc-dimension-radius-8)] [&_[data-slot=tab-button]>span]:!px-0 [&_[data-slot=tab-button]>span]:!py-0 [&_[data-slot=tab-button]>span]:!text-[12px] [&_[data-slot=tab-button]>span]:!font-medium [&_[data-slot=tab-button]>span]:!leading-[18px] [&_[data-slot=tab-button]>span]:!tracking-normal [&_[data-slot=tab-button][data-state=checked]>span]:!text-[color:var(--sqc-color-text-brand)] [&_[data-slot=tab-button][data-state=unchecked]>span]:!text-[color:var(--sqc-color-text-secondary)]"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
