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
    class="mushaf-line"
    :class="{
      'mushaf-line--centered': line.centered,
      'mushaf-line--surah': line.type === 'surah_name',
      'mushaf-line--basmallah': line.type === 'basmallah',
    }"
    dir="rtl"
    translate="no"
    :data-line-number="line.lineNumber"
    :data-line-type="line.type"
  >
    <template v-if="line.type === 'ayah'">
      <div class="mushaf-line__glyphs" :style="{ fontFamily }">
        <MushafWord v-for="word in line.words" :key="word.location" :word="word" />
      </div>
    </template>

    <div v-else-if="line.type === 'surah_name'" class="mushaf-line__surah-name">
      {{ getSurahNameArabic(line.surahNumber ?? 0) }}
    </div>

    <div v-else class="mushaf-line__basmallah">﷽</div>
  </div>
</template>

<style scoped>
.mushaf-line {
  display: flex;
  width: 100%;
  min-height: 1.62em;
  align-items: center;
}

.mushaf-line__glyphs {
  display: flex;
  width: 100%;
  align-items: baseline;
  justify-content: space-between;
  white-space: nowrap;
  font-size: clamp(1.75rem, 7.1vw, 2.35rem);
  line-height: 1.62;
  color: #11100f;
}

.mushaf-line--centered .mushaf-line__glyphs {
  width: auto;
  justify-content: center;
  gap: 0.18em;
  margin-inline: auto;
}

.mushaf-line--surah,
.mushaf-line--basmallah {
  justify-content: center;
}

.mushaf-line__surah-name {
  width: min(82%, 310px);
  border-block: 1px solid color-mix(in srgb, var(--sqc-color-mushaf-border) 72%, transparent);
  padding-block: 4px;
  color: #302a23;
  font-family: "Noto Sans Arabic", system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.mushaf-line__basmallah {
  color: #1a1815;
  font-family: "Amiri Quran", "Noto Naskh Arabic", serif;
  font-size: 1.35rem;
  line-height: 1.7;
  text-align: center;
}
</style>
