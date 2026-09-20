<script setup lang="ts">
import { computed } from 'vue'

export type BaseToastTone = 'success' | 'info' | 'warning' | 'error'

const props = withDefaults(
  defineProps<{
    message?: string
    tone?: BaseToastTone
    dismissible?: boolean
    closeLabel?: string
  }>(),
  {
    message: 'تم الحفظ بنجاح',
    tone: 'success',
    dismissible: true,
    closeLabel: 'إغلاق الإشعار',
  },
)

const emit = defineEmits<{
  close: []
}>()

const toneClasses = computed(() => {
  switch (props.tone) {
    case 'info':
      return {
        background: 'bg-[var(--sqc-color-toast-info-background)]',
        foreground: 'text-[color:var(--sqc-color-toast-info-foreground)]',
        close: 'bg-[var(--sqc-color-toast-info-foreground)]',
        status: 'bg-[var(--sqc-color-status-info)]',
      }
    case 'warning':
      return {
        background: 'bg-[var(--sqc-color-toast-warning-background)]',
        foreground: 'text-[color:var(--sqc-color-toast-warning-foreground)]',
        close: 'bg-[var(--sqc-color-toast-warning-foreground)]',
        status: 'bg-[var(--sqc-color-status-warning)]',
      }
    case 'error':
      return {
        background: 'bg-[var(--sqc-color-toast-error-background)]',
        foreground: 'text-[color:var(--sqc-color-toast-error-foreground)]',
        close: 'bg-[var(--sqc-color-toast-error-foreground)]',
        status: 'bg-[var(--sqc-color-status-error)]',
      }
    default:
      return {
        background: 'bg-[var(--sqc-color-toast-success-background)]',
        foreground: 'text-[color:var(--sqc-color-toast-success-foreground)]',
        close: 'bg-[var(--sqc-color-toast-success-foreground)]',
        status: 'bg-[var(--sqc-color-status-success)]',
      }
  }
})

const ariaRole = computed(() =>
  props.tone === 'error' || props.tone === 'warning' ? 'alert' : 'status',
)
</script>

<template>
  <div
    :role="ariaRole"
    aria-live="polite"
    dir="rtl"
    class="flex h-[56px] w-[342px] items-center justify-between gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] px-[var(--sqc-dimension-spacing-16)] py-[var(--sqc-dimension-spacing-12)] [font-family:var(--sqc-font-family-ui)]"
    :class="toneClasses.background"
  >
    <span
      aria-hidden="true"
      class="block size-[10px] shrink-0 [mask-image:url('/assets/icons/toast-status-10.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/toast-status-10.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
      :class="toneClasses.status"
    />

    <p
      dir="rtl"
      class="min-w-0 flex-1 text-right text-[14px] font-normal leading-[24px]"
      :class="toneClasses.foreground"
    >
      {{ message }}
    </p>

    <button
      v-if="dismissible"
      type="button"
      :aria-label="closeLabel"
      class="-m-[4px] grid size-[24px] shrink-0 place-items-center rounded-[var(--sqc-dimension-radius-4)] p-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sqc-color-border-focus)]"
      @click="emit('close')"
    >
      <span
        aria-hidden="true"
        class="block size-[16px] [mask-image:url('/assets/icons/toast-close-16.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/toast-close-16.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
        :class="toneClasses.close"
      />
    </button>

    <span
      v-else
      aria-hidden="true"
      class="block size-[16px] shrink-0"
    />
  </div>
</template>
