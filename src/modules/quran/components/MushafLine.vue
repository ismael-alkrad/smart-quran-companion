<script setup lang="ts">
import MushafWord from '@/modules/quran/components/MushafWord.vue'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import type { MushafLine } from '@/modules/quran/types/mushaf'

withDefaults(
  defineProps<{
    line: MushafLine
    fontFamily: string
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)
</script>

<template>
  <div
    class="flex w-full min-w-0 items-center justify-center overflow-visible"
    :class="{ 'justify-center': line.type !== 'ayah' }"
    dir="rtl"
    translate="no"
    :data-line-number="line.lineNumber"
    :data-line-type="line.type"
  >
    <template v-if="line.type === 'ayah'">
      <div
        class="mx-auto flex min-w-0 max-w-full items-baseline whitespace-nowrap text-[#11100f] [font-kerning:normal] [text-rendering:optimizeLegibility]"
        :class="[
          compact
            ? 'text-[clamp(0.98rem,2.05vw,1.35rem)] leading-[1.28]'
            : 'text-[clamp(1.24rem,5.55vw,1.72rem)] leading-[1.5]',
          line.centered
            ? 'w-auto justify-center gap-[0.12em]'
            : 'w-[calc(100%_-_12px)] justify-between',
        ]"
        :style="{ fontFamily }"
      >
        <MushafWord
          v-for="word in line.words"
          :key="word.location"
          :word="word"
        />
      </div>
    </template>

    <div
      v-else-if="line.type === 'surah_name'"
      class="relative text-center font-semibold text-[#302a23] [font-family:'Noto_Naskh_Arabic','Amiri',serif] before:absolute before:top-px before:right-0 before:left-0 before:h-px before:bg-[#b8a27f]/70 before:content-[''] after:absolute after:right-0 after:bottom-px after:left-0 after:h-px after:bg-[#b8a27f]/70 after:content-['']"
      :class="compact ? 'w-[82%] py-[2px] text-[0.76rem]' : 'w-[min(84%,320px)] py-[5px] text-[0.98rem]'"
    >
      {{ getSurahNameArabic(line.surahNumber ?? 0) }}
    </div>

    <div
      v-else
      class="text-center text-[#1a1815] [font-family:'Amiri_Quran','Noto_Naskh_Arabic',serif]"
      :class="compact ? 'text-[0.94rem] leading-[1.3]' : 'text-[1.28rem] leading-[1.55]'"
    >
      ﷽
    </div>
  </div>
</template>
