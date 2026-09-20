<script setup lang="ts">
import type { MushafWord } from '@/modules/quran/types/mushaf'

defineProps<{
  word: MushafWord
}>()
</script>

<template>
  <span
    class="inline-block shrink-0 cursor-default select-text"
    translate="no"
    :data-location="word.location"
    :data-verse-key="word.verseKey"
    :data-word-position="word.position"
    v-html="word.codeV2"
  />
</template>
