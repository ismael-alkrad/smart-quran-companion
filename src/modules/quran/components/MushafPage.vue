<script setup lang="ts">
import MushafLine from '@/modules/quran/components/MushafLine.vue'
import MushafPageHeader from '@/modules/quran/components/MushafPageHeader.vue'
import { getQcfV2FontFamily } from '@/modules/quran/services/qcfFont.service'
import type { MushafPage } from '@/modules/quran/types/mushaf'
import { toArabicNumber } from '@/modules/quran/utils/number'

withDefaults(
  defineProps<{
    page: MushafPage
    spread?: boolean
  }>(),
  {
    spread: false,
  },
)
</script>

<template>
  <article
    dir="rtl"
    translate="no"
    class="mx-auto flex w-full flex-col overflow-hidden bg-[var(--sqc-color-mushaf-paper)]"
    :class="
      spread
        ? 'h-dvh min-h-0 max-w-none px-[clamp(12px,1.8vw,20px)] pb-[6px] pt-[8px]'
        : 'min-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] max-w-[500px] px-[clamp(18px,5vw,25px)] pb-[clamp(10px,2.8vw,14px)] pt-[clamp(14px,3.8vw,20px)] max-[360px]:px-3.5 min-[600px]:h-dvh min-[600px]:min-h-0 min-[600px]:max-w-[720px] min-[600px]:rounded-none min-[600px]:border-0 min-[600px]:shadow-none'
    "
  >
    <MushafPageHeader
      :chapters="page.chapters"
      :juz-number="page.juzNumber"
      :compact="spread"
    />

    <section
      class="flex min-h-0 flex-1 flex-col justify-evenly"
      :class="spread ? 'pb-[2px] pt-[6px]' : 'pb-2 pt-[clamp(12px,2.4vh,20px)]'"
      aria-label="صفحة المصحف"
    >
      <MushafLine
        v-for="line in page.lines"
        :key="line.lineNumber"
        :line="line"
        :font-family="getQcfV2FontFamily(page.pageNumber)"
        :compact="spread"
      />
    </section>

    <footer
      class="flex items-center justify-center text-[var(--sqc-color-mushaf-muted)] [font-family:'Noto_Naskh_Arabic','Amiri',serif]"
      :class="spread ? 'min-h-[24px] text-[0.72rem]' : 'min-h-[38px] text-[0.84rem]'"
      aria-label="رقم الصفحة"
    >
      <span
        class="relative grid place-items-center before:absolute before:top-0.5 before:right-0 before:left-0 before:h-px before:bg-[var(--sqc-color-mushaf-border-subtle)] before:content-[''] after:absolute after:right-0 after:bottom-0.5 after:left-0 after:h-px after:bg-[var(--sqc-color-mushaf-border-subtle)] after:content-['']"
        :class="spread ? 'min-h-[22px] min-w-[44px] px-2' : 'min-h-[30px] min-w-[52px] px-3'"
      >
        {{ toArabicNumber(page.pageNumber) }}
      </span>
    </footer>
  </article>
</template>
