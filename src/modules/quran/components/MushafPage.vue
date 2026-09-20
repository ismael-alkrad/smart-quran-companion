<script setup lang="ts">
import MushafLine from '@/modules/quran/components/MushafLine.vue'
import MushafPageHeader from '@/modules/quran/components/MushafPageHeader.vue'
import { getQcfV2FontFamily } from '@/modules/quran/services/qcfFont.service'
import type { MushafPage } from '@/modules/quran/types/mushaf'
import { toArabicNumber } from '@/modules/quran/utils/number'
defineProps<{ page: MushafPage }>()
</script>

<template>
  <article class="mushaf-page" dir="rtl" translate="no">
    <MushafPageHeader :chapters="page.chapters" :juz-number="page.juzNumber" />
    <section class="mushaf-page__lines" aria-label="صفحة المصحف">
      <MushafLine
        v-for="line in page.lines"
        :key="line.lineNumber"
        :line="line"
        :font-family="getQcfV2FontFamily(page.pageNumber)"
      />
    </section>
    <footer class="mushaf-page__footer" aria-label="رقم الصفحة">
      <span>{{ toArabicNumber(page.pageNumber) }}</span>
    </footer>
  </article>
</template>

<style scoped>
.mushaf-page {
  display: flex;
  width: min(100%, 520px);
  min-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  flex-direction: column;
  margin-inline: auto;
  background: var(--sqc-color-background-mushaf);
  padding: 18px 18px 12px;
}
.mushaf-page__lines {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-evenly;
  padding-block: 18px 10px;
}
.mushaf-page__footer {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  color: #665a49;
  font-size: .9rem;
}
.mushaf-page__footer span {
  min-width: 54px;
  border-block: 1px solid color-mix(in srgb, var(--sqc-color-mushaf-border) 55%, transparent);
  padding-block: 3px;
  text-align: center;
}
@media (min-width: 600px) {
  .mushaf-page {
    min-height: min(92dvh, 900px);
    margin-block: 4dvh;
    border: 1px solid color-mix(in srgb, var(--sqc-color-mushaf-border) 35%, transparent);
    border-radius: 24px;
    box-shadow: 0 18px 60px rgb(55 45 32 / 8%);
  }
}
</style>
