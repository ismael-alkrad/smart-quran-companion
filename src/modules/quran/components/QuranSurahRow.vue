<script setup lang="ts">
import QuranHifzStatusBadge, {
  type QuranHifzDisplayStatus,
} from '@/modules/quran/components/QuranHifzStatusBadge.vue'
import { toArabicNumber } from '@/modules/quran/utils/number'

defineProps<{
  surahNumber: number
  surahName: string
  completedAyahs: number
  ayahCount: number
  status: QuranHifzDisplayStatus
}>()
</script>

<template>
  <article
    dir="rtl"
    class="flex h-[82px] w-full shrink-0 items-center gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-elevated)] px-[var(--sqc-dimension-spacing-12)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      class="flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-background-tertiary)]"
      aria-hidden="true"
    >
      <span
        class="whitespace-nowrap text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-brand)]"
      >
        {{ toArabicNumber(surahNumber) }}
      </span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col items-start gap-[4px] overflow-hidden text-right">
      <h3
        dir="rtl"
        class="w-full truncate text-right text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
      >
        {{ surahName }}
      </h3>

      <p
        dir="rtl"
        class="w-full truncate text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
      >
        {{ toArabicNumber(completedAyahs) }} من {{ toArabicNumber(ayahCount) }} آية
      </p>
    </div>

    <QuranHifzStatusBadge :status="status" />

    <span
      aria-hidden="true"
      class="block size-[18px] shrink-0 bg-[var(--sqc-color-text-tertiary)] [mask-image:url('/assets/icons/forward-rtl-18.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/forward-rtl-18.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
    />
  </article>
</template>
