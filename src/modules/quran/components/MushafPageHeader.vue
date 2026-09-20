<script setup lang="ts">
import { computed } from 'vue'
import type { MushafChapter } from '@/modules/quran/types/mushaf'
import { toArabicNumber } from '@/modules/quran/utils/number'

const props = defineProps<{ chapters: MushafChapter[]; juzNumber: number | null }>()
const surahTitle = computed(() => {
  const names = props.chapters.map((chapter) => chapter.nameArabic).filter(Boolean)
  return names.length ? `سورة ${names.join(' / ')}` : 'القرآن الكريم'
})
</script>

<template>
  <header class="mushaf-header" aria-label="معلومات الصفحة">
    <span class="mushaf-header__surah">{{ surahTitle }}</span>
    <span v-if="juzNumber" class="mushaf-header__juz">الجزء {{ toArabicNumber(juzNumber) }}</span>
  </header>
</template>

<style scoped>
.mushaf-header {
  position: relative;
  display: flex;
  min-height: 46px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--sqc-color-mushaf-border);
  border-radius: 18px;
  padding: 7px 22px;
  color: #292521;
  font-size: .93rem;
}
.mushaf-header::before, .mushaf-header::after {
  position: absolute;
  top: 50%;
  width: 9px;
  height: 9px;
  border: 1px solid var(--sqc-color-mushaf-border);
  background: var(--sqc-color-background-mushaf);
  content: "";
  transform: translateY(-50%) rotate(45deg);
}
.mushaf-header::before { right: -5px; }
.mushaf-header::after { left: -5px; }
.mushaf-header__surah { font-weight: 600; }
.mushaf-header__juz { color: #665a49; white-space: nowrap; }
</style>
