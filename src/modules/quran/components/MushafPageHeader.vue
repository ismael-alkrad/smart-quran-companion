<script setup lang="ts">
import { computed } from 'vue'

import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { toArabicNumber } from '@/modules/quran/utils/number'

const props = defineProps<{
  chapters: number[]
  juzNumber: number
}>()

const surahTitle = computed(() => {
  if (!props.chapters.length) return 'القرآن الكريم'
  return props.chapters.map((number) => `سورة ${getSurahNameArabic(number)}`).join(' / ')
})
</script>

<template>
  <header
    class="relative grid min-h-[45px] grid-cols-[minmax(0,1fr)_auto] items-center gap-[18px] rounded-[18px] border border-[#b8a27f]/90 px-5 py-[7px] text-[0.9rem] text-[#2d2822] [direction:ltr] [font-family:'Noto_Naskh_Arabic','Amiri',serif] before:absolute before:top-1/2 before:-right-[5px] before:h-2 before:w-2 before:-translate-y-1/2 before:rotate-45 before:border before:border-[#b8a27f] before:bg-[#fbf7ef] before:content-[''] after:absolute after:top-1/2 after:-left-[5px] after:h-2 after:w-2 after:-translate-y-1/2 after:rotate-45 after:border after:border-[#b8a27f] after:bg-[#fbf7ef] after:content-['']"
    aria-label="معلومات الصفحة"
  >
    <span class="justify-self-start overflow-hidden text-ellipsis whitespace-nowrap font-semibold" dir="rtl">
      {{ surahTitle }}
    </span>
    <span class="justify-self-end whitespace-nowrap text-[#695c4a]" dir="rtl">
      الجزء {{ toArabicNumber(juzNumber) }}
    </span>
  </header>
</template>
