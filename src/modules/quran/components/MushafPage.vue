<script setup lang="ts">
import MushafLine from '@/modules/quran/components/MushafLine.vue'
import MushafPageHeader from '@/modules/quran/components/MushafPageHeader.vue'
import { getQcfV2FontFamily } from '@/modules/quran/services/qcfFont.service'
import type { MushafPage } from '@/modules/quran/types/mushaf'
import { toArabicNumber } from '@/modules/quran/utils/number'

defineProps<{ page: MushafPage }>()
</script>

<template>
  <article
    class="mx-auto flex min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-[500px] flex-col overflow-hidden bg-[#fbf7ef] px-[clamp(18px,5vw,25px)] pt-[clamp(14px,3.8vw,20px)] pb-[clamp(10px,2.8vw,14px)] max-[360px]:px-3.5 min-[600px]:my-[3dvh] min-[600px]:min-h-[min(94dvh,920px)] min-[600px]:rounded-[20px] min-[600px]:border min-[600px]:border-[#b8a27f]/30 min-[600px]:shadow-[0_18px_60px_rgba(55,45,32,0.07)]"
    dir="rtl"
    translate="no"
  >
    <MushafPageHeader :chapters="page.chapters" :juz-number="page.juzNumber" />

    <section
      class="flex min-h-0 flex-1 flex-col justify-evenly pt-[clamp(12px,2.4vh,20px)] pb-2"
      aria-label="صفحة المصحف"
    >
      <MushafLine
        v-for="line in page.lines"
        :key="line.lineNumber"
        :line="line"
        :font-family="getQcfV2FontFamily(page.pageNumber)"
      />
    </section>

    <footer
      class="flex min-h-[38px] items-center justify-center text-[0.84rem] text-[#6d5d47] [font-family:'Noto_Naskh_Arabic','Amiri',serif]"
      aria-label="رقم الصفحة"
    >
      <span
        class="relative grid min-h-[30px] min-w-[52px] place-items-center px-3 before:absolute before:top-0.5 before:right-0 before:left-0 before:h-px before:bg-[#b8a27f]/50 before:content-[''] after:absolute after:right-0 after:bottom-0.5 after:left-0 after:h-px after:bg-[#b8a27f]/50 after:content-['']"
      >
        {{ toArabicNumber(page.pageNumber) }}
      </span>
    </footer>
  </article>
</template>
