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
  min-width: 0;
  align-items: center;
}

.mushaf-line__glyphs {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: baseline;
  justify-content: space-between;
  white-space: nowrap;
  color: #11100f;
  font-size: clamp(1.48rem, 6vw, 1.9rem);
  line-height: 1.5;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
}

.mushaf-line--centered .mushaf-line__glyphs {
  width: auto;
  justify-content: center;
  gap: 0.12em;
  margin-inline: auto;
}

.mushaf-line--surah,
.mushaf-line--basmallah {
  justify-content: center;
}

.mushaf-line__surah-name {
  position: relative;
  width: min(84%, 320px);
  padding-block: 5px;
  color: #302a23;
  font-family: "Noto Naskh Arabic", "Amiri", serif;
  font-size: 0.98rem;
  font-weight: 600;
  text-align: center;
}

.mushaf-line__surah-name::before,
.mushaf-line__surah-name::after {
  position: absolute;
  right: 0;
  left: 0;
  height: 1px;
  background: color-mix(in srgb, var(--sqc-color-mushaf-border) 68%, transparent);
  content: "";
}

.mushaf-line__surah-name::before {
  top: 1px;
}

.mushaf-line__surah-name::after {
  bottom: 1px;
}

.mushaf-line__basmallah {
  color: #1a1815;
  font-family: "Amiri Quran", "Noto Naskh Arabic", serif;
  font-size: 1.28rem;
  line-height: 1.55;
  text-align: center;
}

@media (max-width: 380px) {
  .mushaf-line__glyphs {
    font-size: clamp(1.36rem, 6.15vw, 1.62rem);
  }
}
</style>
