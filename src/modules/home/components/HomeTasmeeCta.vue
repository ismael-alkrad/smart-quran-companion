<script setup lang="ts">
import { BaseButton } from '@/shared/components'

const emit = defineEmits<{
  start: []
}>()
</script>

<template>
  <section
    dir="rtl"
    class="flex w-full flex-col items-start gap-[10px] rounded-[20px] bg-[var(--sqc-color-background-subtle)] p-[var(--sqc-dimension-spacing-16)] [font-family:var(--sqc-font-family-ui)]"
  >
    <h2
      dir="rtl"
      class="w-full text-right text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
    >
      جاهز للتسميع؟
    </h2>

    <p
      dir="rtl"
      class="w-full text-right text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
    >
      انتقل إلى مهمة الحفظ اليومية وابدأ التسميع عندما يصبح المقطع جاهزًا.
    </p>

    <BaseButton
      size="large"
      variant="primary"
      class="w-full"
      @click="emit('start')"
    >
      ابدأ التسميع
    </BaseButton>
  </section>
</template>
