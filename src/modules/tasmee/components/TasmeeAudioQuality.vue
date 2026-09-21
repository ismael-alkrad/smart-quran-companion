<script setup lang="ts">
import { computed } from 'vue'

export type TasmeeAudioQualityState =
  | 'idle'
  | 'checking'
  | 'good'
  | 'quiet'
  | 'clipping'
  | 'denied'
  | 'unsupported'

const props = withDefaults(
  defineProps<{
    state?: TasmeeAudioQualityState
  }>(),
  {
    state: 'idle',
  },
)

const presentation = computed(() => {
  switch (props.state) {
    case 'checking':
      return {
        label: 'جاري فحص الصوت',
        detail: 'تحدث بصوت طبيعي لبضع ثوانٍ',
        background: 'bg-[var(--sqc-color-ai-analyzing-background)]',
        foreground: 'text-[color:var(--sqc-color-ai-analyzing-foreground)]',
        dot: 'bg-[var(--sqc-color-ai-analyzing-foreground)]',
      }
    case 'good':
      return {
        label: 'الصوت واضح',
        detail: 'مناسب للتحليل',
        background: 'bg-[var(--sqc-color-background-subtle)]',
        foreground: 'text-[color:var(--sqc-color-status-success)]',
        dot: 'bg-[var(--sqc-color-status-success)]',
      }
    case 'quiet':
      return {
        label: 'الصوت منخفض',
        detail: 'اقترب من الميكروفون ثم أعد الاختبار',
        background: 'bg-[var(--sqc-color-potentialissue-hesitation-background)]',
        foreground: 'text-[color:var(--sqc-color-potentialissue-hesitation-foreground)]',
        dot: 'bg-[var(--sqc-color-potentialissue-hesitation-foreground)]',
      }
    case 'clipping':
      return {
        label: 'الصوت مرتفع جدًا',
        detail: 'ابتعد قليلًا عن الميكروفون ثم أعد الاختبار',
        background: 'bg-[var(--sqc-color-potentialissue-hesitation-background)]',
        foreground: 'text-[color:var(--sqc-color-potentialissue-hesitation-foreground)]',
        dot: 'bg-[var(--sqc-color-potentialissue-hesitation-foreground)]',
      }
    case 'denied':
      return {
        label: 'إذن الميكروفون مرفوض',
        detail: 'اسمح بالوصول إلى الميكروفون ثم أعد الاختبار',
        background: 'bg-[var(--sqc-color-potentialissue-substitution-background)]',
        foreground: 'text-[color:var(--sqc-color-potentialissue-substitution-foreground)]',
        dot: 'bg-[var(--sqc-color-potentialissue-substitution-foreground)]',
      }
    case 'unsupported':
      return {
        label: 'الميكروفون غير متاح',
        detail: 'هذا المتصفح أو الجهاز لا يتيح فحص الصوت',
        background: 'bg-[var(--sqc-color-potentialissue-substitution-background)]',
        foreground: 'text-[color:var(--sqc-color-potentialissue-substitution-foreground)]',
        dot: 'bg-[var(--sqc-color-potentialissue-substitution-foreground)]',
      }
    default:
      return {
        label: 'جاهز لفحص الصوت',
        detail: 'سيبدأ الفحص عند دخول هذه الخطوة',
        background: 'bg-[var(--sqc-color-background-subtle)]',
        foreground: 'text-[color:var(--sqc-color-text-secondary)]',
        dot: 'bg-[var(--sqc-color-text-secondary)]',
      }
  }
})
</script>

<template>
  <section
    dir="rtl"
    class="flex h-[78px] w-full flex-col items-start gap-[var(--sqc-dimension-spacing-4)] rounded-[var(--sqc-dimension-radius-12)] p-[var(--sqc-dimension-spacing-12)] [font-family:var(--sqc-font-family-ui)]"
    :class="presentation.background"
  >
    <div class="flex h-[22px] items-center gap-[8px] overflow-hidden">
      <span
        class="whitespace-nowrap text-right text-[12px] font-medium leading-[18px]"
        :class="presentation.foreground"
      >
        {{ presentation.label }}
      </span>

      <span
        aria-hidden="true"
        class="size-[8px] shrink-0 rounded-full"
        :class="presentation.dot"
      />
    </div>

    <p class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]">
      {{ presentation.detail }}
    </p>
  </section>
</template>
