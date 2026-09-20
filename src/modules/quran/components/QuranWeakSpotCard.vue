<script setup lang="ts">
import { computed } from 'vue'

export type QuranWeakSpotType = 'ayah' | 'transition' | 'similar-passage'

const props = withDefaults(
  defineProps<{
    title?: string
    location?: string
    metric?: string
    type?: QuranWeakSpotType
  }>(),
  {
    title: 'موضع يحتاج تثبيت',
    location: 'سورة البقرة · الآيات 20–24',
    metric: 'قوة الحفظ 42%',
    type: 'ayah',
  },
)

const chipClasses = computed(() => {
  if (props.type === 'similar-passage') {
    return {
      background: 'bg-[var(--sqc-color-ai-analyzing-background)]',
      foreground: 'text-[color:var(--sqc-color-ai-analyzing-foreground)]',
    }
  }

  if (props.type === 'transition') {
    return {
      background: 'bg-[var(--sqc-color-potentialissue-transition-background)]',
      foreground: 'text-[color:var(--sqc-color-potentialissue-transition-foreground)]',
    }
  }

  return {
    background: 'bg-[var(--sqc-color-potentialissue-hesitation-background)]',
    foreground: 'text-[color:var(--sqc-color-potentialissue-hesitation-foreground)]',
  }
})
</script>

<template>
  <section
    dir="rtl"
    class="flex h-[132px] w-full flex-col items-start gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-elevated)] p-[var(--sqc-dimension-spacing-16)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      dir="ltr"
      class="flex h-[30px] w-full shrink-0 items-center justify-between overflow-hidden"
    >
      <span
        dir="rtl"
        class="shrink-0 rounded-[var(--sqc-dimension-radius-999)] px-[var(--sqc-dimension-spacing-8)] py-[var(--sqc-dimension-spacing-4)] text-[12px] font-medium leading-[18px]"
        :class="[chipClasses.background, chipClasses.foreground]"
      >
        {{ metric }}
      </span>

      <h3
        dir="rtl"
        class="shrink-0 whitespace-nowrap text-right text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
      >
        {{ title }}
      </h3>
    </div>

    <p
      dir="auto"
      class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
    >
      {{ location }}
    </p>

    <p
      dir="auto"
      class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-tertiary)]"
    >
      أضيف تلقائيًا إلى المراجعة الذكية
    </p>
  </section>
</template>
