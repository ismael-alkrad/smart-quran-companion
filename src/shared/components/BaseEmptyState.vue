<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton.vue'
import { computed } from 'vue'

export type BaseEmptyStateType = 'default' | 'offline' | 'ai-unavailable'

const props = withDefaults(
  defineProps<{
    title?: string
    body?: string
    type?: BaseEmptyStateType
    actionLabel?: string
    actionDisabled?: boolean
    actionLoading?: boolean
  }>(),
  {
    title: 'لا يوجد محتوى بعد',
    body: 'ستظهر العناصر هنا عند إضافتها.',
    type: 'default',
    actionLabel: undefined,
    actionDisabled: false,
    actionLoading: false,
  },
)

const emit = defineEmits<{
  action: []
}>()

const illustrationClasses = computed(() => {
  if (props.type === 'offline') {
    return {
      background: 'bg-[var(--sqc-color-background-subtle)]',
      symbol: 'w-[28px] bg-[var(--sqc-color-text-secondary)]',
    }
  }

  if (props.type === 'ai-unavailable') {
    return {
      background: 'bg-[var(--sqc-color-ai-unavailable-background)]',
      symbol: 'w-[24px] bg-[var(--sqc-color-ai-unavailable-foreground)]',
    }
  }

  return {
    background: 'bg-[var(--sqc-color-ai-active-background)]',
    symbol: 'w-[24px] bg-[var(--sqc-color-ai-active-foreground)]',
  }
})

const resolvedActionLabel = computed(() => {
  if (props.actionLabel) return props.actionLabel
  if (props.type === 'offline') return 'إعادة المحاولة'
  if (props.type === 'ai-unavailable') return 'المتابعة بدون AI'
  return 'استكشاف'
})

function handleAction() {
  if (props.actionDisabled || props.actionLoading) return
  emit('action')
}
</script>

<template>
  <section
    dir="rtl"
    class="flex w-[342px] max-w-full flex-col items-center gap-[var(--sqc-dimension-spacing-16)] p-[var(--sqc-dimension-spacing-24)] text-center [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      aria-hidden="true"
      class="flex size-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--sqc-dimension-radius-999)]"
      :class="illustrationClasses.background"
    >
      <span
        class="h-[4px] shrink-0 rounded-[var(--sqc-dimension-radius-999)]"
        :class="illustrationClasses.symbol"
      />
    </div>

    <h2
      dir="auto"
      class="shrink-0 whitespace-nowrap text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
    >
      {{ title }}
    </h2>

    <p
      dir="auto"
      class="h-[72px] w-[294px] max-w-full shrink-0 text-center text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
    >
      <slot>{{ body }}</slot>
    </p>

    <BaseButton
      size="large"
      variant="primary"
      :disabled="actionDisabled"
      :loading="actionLoading"
      @click="handleAction"
    >
      {{ resolvedActionLabel }}
    </BaseButton>
  </section>
</template>
