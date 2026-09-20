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
  <header class="mushaf-header" aria-label="معلومات الصفحة">
    <span class="mushaf-header__surah" dir="rtl">{{ surahTitle }}</span>
    <span class="mushaf-header__juz" dir="rtl">الجزء {{ toArabicNumber(juzNumber) }}</span>
  </header>
</template>

<style scoped>
.mushaf-header {
  position: relative;
  display: grid;
  min-height: 45px;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  direction: ltr;
  border: 1px solid color-mix(in srgb, var(--sqc-color-mushaf-border) 88%, transparent);
  border-radius: 18px;
  padding: 7px 20px;
  color: #2d2822;
  font-family: "Noto Naskh Arabic", "Amiri", serif;
  font-size: 0.9rem;
}

.mushaf-header::before,
.mushaf-header::after {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  border: 1px solid var(--sqc-color-mushaf-border);
  background: var(--sqc-color-background-mushaf);
  content: "";
  transform: translateY(-50%) rotate(45deg);
}

.mushaf-header::before {
  right: -5px;
}

.mushaf-header::after {
  left: -5px;
}

.mushaf-header__surah {
  overflow: hidden;
  justify-self: start;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mushaf-header__juz {
  justify-self: end;
  color: #695c4a;
  white-space: nowrap;
}
</style>
