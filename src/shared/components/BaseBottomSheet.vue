<script setup lang="ts">
import { BottomSheet as FrappeBottomSheet } from 'frappe-ui'
import BaseButton from '@/shared/components/BaseButton.vue'

export type BaseBottomSheetSize = 'compact' | 'expanded'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    body?: string
    size?: BaseBottomSheetSize
    actionLabel?: string
    expandedHint?: string
    dismissible?: boolean
    actionDisabled?: boolean
    actionLoading?: boolean
  }>(),
  {
    modelValue: false,
    title: 'اختيار سريع',
    body: 'اختر الإجراء المناسب للمتابعة.',
    size: 'compact',
    actionLabel: 'متابعة',
    expandedHint: 'سيطلب التطبيق إذن الميكروفون والخصوصية عند الحاجة.',
    dismissible: true,
    actionDisabled: false,
    actionLoading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  action: []
  close: []
  'after-leave': []
}>()

function handleOpenChange(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}

function handleAction() {
  if (props.actionDisabled || props.actionLoading) return
  emit('action')
}
</script>

<template>
  <FrappeBottomSheet
    :open="modelValue"
    :dismissible="dismissible"
    @update:open="handleOpenChange"
    @after-leave="emit('after-leave')"
  >
    <section
      dir="rtl"
      class="relative z-10 -mt-[20px] flex w-full flex-col items-center gap-[var(--sqc-dimension-spacing-16)] rounded-t-[var(--sqc-dimension-radius-16)] bg-[var(--sqc-color-background-elevated)] px-[var(--sqc-dimension-spacing-20)] pb-[var(--sqc-dimension-spacing-24)] pt-[var(--sqc-dimension-spacing-12)] text-right [font-family:var(--sqc-font-family-ui)]"
      :class="size === 'expanded' ? 'h-[320px]' : 'h-[240px]'"
    >
      <span
        aria-hidden="true"
        class="h-[4px] w-[40px] shrink-0 rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-border-default)]"
      />

      <h2
        dir="auto"
        class="w-full shrink-0 text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
      >
        {{ title }}
      </h2>

      <p
        dir="auto"
        class="w-full shrink-0 text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
        :class="size === 'expanded' ? 'h-[72px]' : 'h-[48px]'"
      >
        <slot name="body">{{ body }}</slot>
      </p>

      <div
        v-if="size === 'expanded'"
        class="flex w-full shrink-0 flex-col items-end overflow-hidden rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-subtle)] p-[var(--sqc-dimension-spacing-12)]"
      >
        <slot name="expanded">
          <p
            dir="auto"
            class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
          >
            {{ expandedHint }}
          </p>
        </slot>
      </div>

      <BaseButton
        size="medium"
        variant="primary"
        :disabled="actionDisabled"
        :loading="actionLoading"
        @click="handleAction"
      >
        {{ actionLabel }}
      </BaseButton>
    </section>
  </FrappeBottomSheet>
</template>
