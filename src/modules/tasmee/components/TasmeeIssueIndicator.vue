<script setup lang="ts">
import { computed } from 'vue'

import type { TasmeeIssue } from '@/modules/tasmee/api'

const props = defineProps<{
  issue: TasmeeIssue
}>()

const label = computed(() => {
  if (props.issue.category === 'audio') return 'الصوت غير واضح'
  if (props.issue.issue_type === 'omission') return 'حذف'
  if (props.issue.issue_type === 'substitution') return 'استبدال'
  if (props.issue.issue_type === 'insertion') return 'إضافة'
  if (props.issue.issue_type === 'sequence') return 'ترتيب'
  if (props.issue.issue_type === 'hesitation') return 'تردد'
  if (props.issue.issue_type === 'transition') return 'انتقال'
  return 'ملاحظة'
})

const stateClasses = computed(() => {
  if (props.issue.category === 'audio') {
    return {
      background: 'bg-[var(--sqc-color-potentialissue-audiounclear-background,#eff6ff)]',
      foreground: 'text-[color:var(--sqc-color-potentialissue-audiounclear-foreground,#1d4ed8)]',
      dot: 'bg-[var(--sqc-color-potentialissue-audiounclear-foreground,#1d4ed8)]',
    }
  }

  if (props.issue.category === 'memorization') {
    return {
      background: 'bg-[var(--sqc-color-potentialissue-substitution-background,#fef2f2)]',
      foreground: 'text-[color:var(--sqc-color-potentialissue-substitution-foreground,#b91c1c)]',
      dot: 'bg-[var(--sqc-color-potentialissue-substitution-foreground,#b91c1c)]',
    }
  }

  return {
    background: 'bg-[var(--sqc-color-potentialissue-hesitation-background,#fffbeb)]',
    foreground: 'text-[color:var(--sqc-color-potentialissue-hesitation-foreground,#92400e)]',
    dot: 'bg-[var(--sqc-color-potentialissue-hesitation-foreground,#92400e)]',
  }
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center gap-[var(--sqc-dimension-spacing-8)] rounded-[var(--sqc-dimension-radius-999)] px-[var(--sqc-dimension-spacing-8)] py-[var(--sqc-dimension-spacing-4)] text-[12px] font-medium leading-[18px]"
    :class="[stateClasses.background, stateClasses.foreground]"
  >
    <span
      aria-hidden="true"
      class="size-[7px] shrink-0 rounded-full"
      :class="stateClasses.dot"
    />
    {{ label }}
  </span>
</template>
