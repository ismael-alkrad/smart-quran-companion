<script setup lang="ts">
import { Alert as FrappeAlert } from 'frappe-ui'
import { computed } from 'vue'

export type BaseBannerTone = 'info' | 'warning' | 'error'

const props = withDefaults(
  defineProps<{
    title?: string
    body?: string
    tone?: BaseBannerTone
  }>(),
  {
    title: 'معلومة',
    body: 'تفاصيل الحالة.',
    tone: 'info',
  },
)

const frappeTheme = computed(() => {
  if (props.tone === 'warning') return 'amber' as const
  if (props.tone === 'error') return 'red' as const
  return 'blue' as const
})

const toneClasses = computed(() => {
  if (props.tone === 'warning') {
    return {
      background: '!bg-[var(--sqc-color-potentialissue-hesitation-background)]',
      foreground: '!text-[color:var(--sqc-color-potentialissue-hesitation-foreground)]',
      indicator: 'bg-[var(--sqc-color-potentialissue-hesitation-foreground)]',
    }
  }

  if (props.tone === 'error') {
    return {
      background: '!bg-[var(--sqc-color-potentialissue-substitution-background)]',
      foreground: '!text-[color:var(--sqc-color-potentialissue-substitution-foreground)]',
      indicator: 'bg-[var(--sqc-color-potentialissue-substitution-foreground)]',
    }
  }

  return {
    background: '!bg-[var(--sqc-color-ai-analyzing-background)]',
    foreground: '!text-[color:var(--sqc-color-ai-analyzing-foreground)]',
    indicator: 'bg-[var(--sqc-color-ai-analyzing-foreground)]',
  }
})
</script>

<template>
  <FrappeAlert
    :title="title"
    :description="body"
    :theme="frappeTheme"
    :icon="false"
    dir="rtl"
    class="!w-[358px] !max-w-full !rounded-[var(--sqc-dimension-radius-12)] !p-[var(--sqc-dimension-spacing-16)] text-right [font-family:var(--sqc-font-family-ui)] [&>div:first-child]:!items-start [&>div:first-child]:!gap-[var(--sqc-dimension-spacing-12)] [&_[data-slot=prefix]]:!size-[10px] [&_[data-slot=title]]:!min-w-0 [&_[data-slot=title]]:!text-[16px] [&_[data-slot=title]]:!font-semibold [&_[data-slot=title]]:!leading-[26px] [&_[data-slot=description]]:!mr-[22px] [&_[data-slot=description]]:!h-[40px] [&_[data-slot=description]]:!w-[280px] [&_[data-slot=description]]:!max-w-[calc(100%-22px)] [&_[data-slot=description]]:!text-right [&_[data-slot=description]]:!text-[14px] [&_[data-slot=description]]:!font-normal [&_[data-slot=description]]:!leading-[24px]"
    :class="[toneClasses.background, toneClasses.foreground]"
  >
    <template #prefix>
      <span
        aria-hidden="true"
        class="block size-[10px] shrink-0 [mask-image:url('/assets/icons/toast-status-10.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/toast-status-10.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
        :class="toneClasses.indicator"
      />
    </template>

    <template #title>
      <span
        dir="auto"
        class="block whitespace-nowrap"
        :class="toneClasses.foreground"
      >
        {{ title }}
      </span>
    </template>

    <template #description>
      <span
        dir="auto"
        class="block"
        :class="toneClasses.foreground"
      >
        <slot>{{ body }}</slot>
      </span>
    </template>
  </FrappeAlert>
</template>
