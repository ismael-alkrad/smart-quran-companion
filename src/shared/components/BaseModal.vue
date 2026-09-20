<script setup lang="ts">
import { Dialog as FrappeDialog } from 'frappe-ui'
import BaseButton from '@/shared/components/BaseButton.vue'

export type BaseModalTone = 'default' | 'destructive'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    body?: string
    tone?: BaseModalTone
    confirmLabel?: string
    cancelLabel?: string
    dismissible?: boolean
    confirmDisabled?: boolean
    cancelDisabled?: boolean
    confirmLoading?: boolean
  }>(),
  {
    modelValue: false,
    title: 'تأكيد الإجراء',
    body: 'راجع التفاصيل قبل المتابعة.',
    tone: 'default',
    confirmLabel: undefined,
    cancelLabel: 'إلغاء',
    dismissible: true,
    confirmDisabled: false,
    cancelDisabled: false,
    confirmLoading: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  close: []
}>()

const FrappeDialogTitle = FrappeDialog.Title
const FrappeDialogDescription = FrappeDialog.Description

function handleOpenChange(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleConfirm() {
  if (props.confirmDisabled || props.confirmLoading) return
  emit('confirm')
}

function resolvedConfirmLabel() {
  return props.confirmLabel ?? (props.tone === 'destructive' ? 'إنهاء' : 'تأكيد')
}
</script>

<template>
  <FrappeDialog
    :open="modelValue"
    size="xs"
    bare
    :dismissible="dismissible"
    :show-close-button="false"
    @update:open="handleOpenChange"
  >
    <template #default>
      <section
        dir="rtl"
        class="flex h-[220px] w-full flex-col gap-[var(--sqc-dimension-spacing-16)] rounded-[var(--sqc-dimension-radius-16)] bg-[var(--sqc-color-background-elevated)] p-[var(--sqc-dimension-spacing-24)] text-right [font-family:var(--sqc-font-family-ui)]"
      >
        <FrappeDialogTitle
          as="h2"
          class="shrink-0 whitespace-nowrap text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
        >
          {{ title }}
        </FrappeDialogTitle>

        <FrappeDialogDescription
          as="p"
          class="h-[48px] w-full shrink-0 text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
        >
          <slot>{{ body }}</slot>
        </FrappeDialogDescription>

        <div
          dir="ltr"
          class="flex w-full shrink-0 items-start gap-[var(--sqc-dimension-spacing-12)] overflow-hidden"
        >
          <BaseButton
            size="medium"
            variant="secondary"
            :disabled="cancelDisabled || confirmLoading"
            @click="handleCancel"
          >
            {{ cancelLabel }}
          </BaseButton>

          <BaseButton
            size="medium"
            :variant="tone === 'destructive' ? 'destructive' : 'primary'"
            :disabled="confirmDisabled"
            :loading="confirmLoading"
            @click="handleConfirm"
          >
            {{ resolvedConfirmLabel() }}
          </BaseButton>
        </div>
      </section>
    </template>
  </FrappeDialog>
</template>
