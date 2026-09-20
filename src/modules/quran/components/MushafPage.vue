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
  width: min(100%, 500px);
  min-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  flex-direction: column;
  margin-inline: auto;
  overflow: hidden;
  background: var(--sqc-color-background-mushaf);
  padding:
    clamp(14px, 3.8vw, 20px)
    clamp(18px, 5vw, 25px)
    clamp(10px, 2.8vw, 14px);
}

.mushaf-page__lines {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-evenly;
  min-height: 0;
  padding-block: clamp(12px, 2.4vh, 20px) 8px;
}

.mushaf-page__footer {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  color: #6d5d47;
  font-family: "Noto Naskh Arabic", "Amiri", serif;
  font-size: 0.84rem;
}

.mushaf-page__footer span {
  position: relative;
  display: grid;
  min-width: 52px;
  min-height: 30px;
  place-items: center;
  padding-inline: 12px;
}

.mushaf-page__footer span::before,
.mushaf-page__footer span::after {
  position: absolute;
  right: 0;
  left: 0;
  height: 1px;
  background: color-mix(in srgb, var(--sqc-color-mushaf-border) 52%, transparent);
  content: "";
}

.mushaf-page__footer span::before {
  top: 2px;
}

.mushaf-page__footer span::after {
  bottom: 2px;
}

@media (max-width: 360px) {
  .mushaf-page {
    padding-inline: 14px;
  }
}

@media (min-width: 600px) {
  .mushaf-page {
    min-height: min(94dvh, 920px);
    margin-block: 3dvh;
    border: 1px solid color-mix(in srgb, var(--sqc-color-mushaf-border) 32%, transparent);
    border-radius: 20px;
    box-shadow: 0 18px 60px rgb(55 45 32 / 7%);
  }
}
</style>
