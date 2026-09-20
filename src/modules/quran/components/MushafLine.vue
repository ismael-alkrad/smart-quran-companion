<script setup lang="ts">
import MushafWord from '@/modules/quran/components/MushafWord.vue'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import type { MushafLine } from '@/modules/quran/types/mushaf'

defineProps<{
  line: MushafLine
  fontFamily: string
}>()
</script>

<template>
  <div
    class="flex w-full min-w-0 items-center"
    :class="{ 'justify-center': line.type !== 'ayah' }"
    dir="rtl"
    translate="no"
    :data-line-number="line.lineNumber"
    :data-line-type="line.type"
  >
    <template v-if="line.type === 'ayah'">
      <div
        class="flex min-w-0 items-baseline whitespace-nowrap text-[#11100f] [font-kerning:normal] [text-rendering:optimizeLegibility] text-[clamp(1.48rem,6vw,1.9rem)] leading-[1.5] max-[380px]:text-[clamp(1.36rem,6.15vw,1.62rem)]"
        :class="line.centered ? 'mx-auto w-auto justify-center gap-[0.12em]' : 'w-full justify-between'"
        :style="{ fontFamily }"
      >
        <MushafWord v-for="word in line.words" :key="word.location" :word="word" />
      </div>
    </template>

    <div
      v-else-if="line.type === 'surah_name'"
      class="relative w-[min(84%,320px)] py-[5px] text-center text-[0.98rem] font-semibold text-[#302a23] [font-family:'Noto_Naskh_Arabic','Amiri',serif] before:absolute before:top-px before:right-0 before:left-0 before:h-px before:bg-[#b8a27f]/70 before:content-[''] after:absolute after:right-0 after:bottom-px after:left-0 after:h-px after:bg-[#b8a27f]/70 after:content-['']"
    >
      {{ getSurahNameArabic(line.surahNumber ?? 0) }}
    </div>

    <div
      v-else
      class="text-center text-[1.28rem] leading-[1.55] text-[#1a1815] [font-family:'Amiri_Quran','Noto_Naskh_Arabic',serif]"
    >
      ﷽
    </div>
  </div>
</template>
