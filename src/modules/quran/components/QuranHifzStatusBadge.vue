<script setup lang="ts">
import { computed } from 'vue'

import type { HifzStatus } from '@/modules/quran/api'
import { getHifzStatusLabel } from '@/modules/quran/utils/hifz'

export type QuranHifzDisplayStatus = HifzStatus | 'new'

const props = withDefaults(
  defineProps<{
    status?: QuranHifzDisplayStatus
  }>(),
  {
    status: 'new',
  },
)

const label = computed(() => getHifzStatusLabel(props.status))

const toneClass = computed(() => {
  switch (props.status) {
    case 'initial_hifz':
      return 'bg-[var(--sqc-color-quranstate-initialhifz-background)] text-[color:var(--sqc-color-quranstate-initialhifz-foreground)]'
    case 'memorizing':
      return 'bg-[var(--sqc-color-quranstate-memorizing-background)] text-[color:var(--sqc-color-quranstate-memorizing-foreground)]'
    case 'pending_tasmee':
      return 'bg-[var(--sqc-color-quranstate-pendingtasmee-background)] text-[color:var(--sqc-color-quranstate-pendingtasmee-foreground)]'
    case 'pending_approval':
      return 'bg-[var(--sqc-color-quranstate-pendingapproval-background)] text-[color:var(--sqc-color-quranstate-pendingapproval-foreground)]'
    case 'approved':
      return 'bg-[var(--sqc-color-quranstate-approved-background)] text-[color:var(--sqc-color-quranstate-approved-foreground)]'
    case 'needs_review':
      return 'bg-[var(--sqc-color-quranstate-needsreview-background)] text-[color:var(--sqc-color-quranstate-needsreview-foreground)]'
    case 'mastered':
      return 'bg-[var(--sqc-color-quranstate-mastered-background)] text-[color:var(--sqc-color-quranstate-mastered-foreground)]'
    default:
      return 'bg-[var(--sqc-color-quranstate-new-background)] text-[color:var(--sqc-color-quranstate-new-foreground)]'
  }
})
</script>

<template>
  <span
    dir="rtl"
    class="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--sqc-dimension-radius-999)] px-[var(--sqc-dimension-spacing-8)] py-[var(--sqc-dimension-spacing-4)] text-right text-[12px] font-medium leading-[18px] [font-family:var(--sqc-font-family-ui)]"
    :class="toneClass"
  >
    {{ label }}
  </span>
</template>
