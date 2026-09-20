<script setup lang="ts">
import { computed } from 'vue'

import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { toArabicNumber } from '@/modules/quran/utils/number'

const props = withDefaults(
  defineProps<{
    chapters: number[]
    juzNumber: number
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const surahTitle = computed(() => {
  if (!props.chapters.length) return 'القرآن الكريم'
  return props.chapters.map((number) => `سورة ${getSurahNameArabic(number)}`).join(' / ')
})
</script>

<template>
  <header
    dir="rtl"
    class="relative grid grid-cols-[minmax(0,1fr)_auto] items-center border border-[var(--sqc-color-mushaf-border)] text-[var(--sqc-color-mushaf-ink)] [font-family:'Noto_Naskh_Arabic','Amiri',serif] before:absolute before:top-1/2 before:-right-[5px] before:h-2 before:w-2 before:-translate-y-1/2 before:rotate-45 before:border before:border-[var(--sqc-color-mushaf-border)] before:bg-[var(--sqc-color-mushaf-paper)] before:content-[''] after:absolute after:top-1/2 after:-left-[5px] after:h-2 after:w-2 after:-translate-y-1/2 after:rotate-45 after:border after:border-[var(--sqc-color-mushaf-border)] after:bg-[var(--sqc-color-mushaf-paper)] after:content-['']"
    :class="
      compact
        ? 'min-h-[34px] gap-[10px] rounded-[12px] px-3 py-[4px] text-[0.74rem]'
        : 'min-h-[45px] gap-[18px] rounded-[18px] px-5 py-[7px] text-[0.9rem]'
    "
    aria-label="معلومات الصفحة"
  >
    <span class="justify-self-start overflow-hidden text-ellipsis whitespace-nowrap font-semibold" dir="rtl">
      {{ surahTitle }}
    </span>
    <span class="justify-self-end whitespace-nowrap text-[var(--sqc-color-mushaf-muted)]" dir="rtl">
      الجزء {{ toArabicNumber(juzNumber) }}
    </span>
  </header>
</template>
