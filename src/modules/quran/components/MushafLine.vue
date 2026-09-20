<script setup lang="ts">
import MushafWord from '@/modules/quran/components/MushafWord.vue'
import type { MushafLine } from '@/modules/quran/types/mushaf'
defineProps<{ line: MushafLine; fontFamily: string }>()
</script>

<template>
  <div
    class="mushaf-line"
    :class="{ 'mushaf-line--centered': line.centered }"
    :style="{ fontFamily }"
    dir="rtl"
    translate="no"
    :data-line-number="line.lineNumber"
  >
    <MushafWord v-for="word in line.words" :key="word.location" :word="word" />
  </div>
</template>

<style scoped>
.mushaf-line {
  display: flex;
  width: 100%;
  align-items: baseline;
  justify-content: space-between;
  white-space: nowrap;
  font-size: clamp(1.75rem, 7.1vw, 2.35rem);
  line-height: 1.62;
  color: #11100f;
}
.mushaf-line--centered { justify-content: center; gap: 0.18em; }
</style>
