<script setup lang="ts">
import type { MushafWord } from '@/modules/quran/types/mushaf'

defineProps<{
  word: MushafWord
}>()
</script>

<template>
  <span
    class="mushaf-word"
    translate="no"
    :data-location="word.location"
    :data-verse-key="word.verseKey"
    :data-word-position="word.position"
    v-html="word.codeV2"
  />
</template>

<style scoped>
.mushaf-word {
  display: inline-block;
  flex: 0 0 auto;
  cursor: default;
  user-select: text;
}
</style>
