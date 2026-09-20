<script setup lang="ts">
import {
  TabList as FrappeTabList,
  TabTrigger as FrappeTabTrigger,
  Tabs as FrappeTabs,
  type TabValue,
} from 'frappe-ui'
import { computed } from 'vue'

export interface BaseTabItem {
  value: TabValue
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: TabValue
    items?: BaseTabItem[]
  }>(),
  {
    modelValue: undefined,
    items: () => [
      { value: '1', label: 'نظرة عامة' },
      { value: '2', label: 'التقدم' },
    ],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: TabValue]
}>()

const visibleItems = computed(() => props.items.slice(0, 3))

const indicatorWidthClass = computed(() =>
  visibleItems.value.length === 2 ? 'w-[45px]' : 'w-[40px]',
)
</script>

<template>
  <FrappeTabs
    :model-value="props.modelValue"
    dir="rtl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <FrappeTabList
      variant="underline"
      size="sm"
      class="!flex !h-[48px] !w-full !items-start !gap-0 !border-b-0 [font-family:var(--sqc-font-family-ui)] [&_[data-slot=tab-indicator]]:!hidden [&_[data-slot=tab-trigger]]:!min-w-0 [&_[data-slot=tab-trigger]]:!flex-1 [&_[data-slot=tab-trigger]>span]:!h-[48px] [&_[data-slot=tab-trigger]>span]:!w-full [&_[data-slot=tab-trigger]>span]:!gap-0 [&_[data-slot=tab-trigger]>span]:!overflow-hidden [&_[data-slot=tab-trigger]>span>span]:!flex [&_[data-slot=tab-trigger]>span>span]:!h-full [&_[data-slot=tab-trigger]>span>span]:!w-full [&_[data-slot=tab-trigger]>span>span]:!flex-col [&_[data-slot=tab-trigger]>span>span]:!items-center [&_[data-slot=tab-trigger]>span>span]:!justify-end [&_[data-slot=tab-trigger]>span>span]:!gap-[6px] [&_[data-slot=tab-trigger]>span>span]:!overflow-visible"
    >
      <FrappeTabTrigger
        v-for="item in visibleItems"
        :key="item.value"
        :value="item.value"
        :label="item.label"
        :disabled="item.disabled"
      >
        <template #default="{ selected }">
          <span
            dir="auto"
            class="shrink-0 whitespace-nowrap text-center text-[12px] font-medium leading-[18px]"
            :class="
              selected
                ? 'text-[color:var(--sqc-color-text-brand)]'
                : 'text-[color:var(--sqc-color-text-secondary)]'
            "
          >
            {{ item.label }}
          </span>

          <span
            aria-hidden="true"
            class="h-[2px] shrink-0 rounded-[var(--sqc-dimension-radius-999)]"
            :class="[
              indicatorWidthClass,
              selected
                ? 'bg-[var(--sqc-color-action-primary)]'
                : 'bg-transparent',
            ]"
          />
        </template>
      </FrappeTabTrigger>
    </FrappeTabList>
  </FrappeTabs>
</template>
