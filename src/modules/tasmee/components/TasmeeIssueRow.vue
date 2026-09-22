<script setup lang="ts">
import { computed } from 'vue'

import type { TasmeeIssue } from '@/modules/tasmee/api'
import TasmeeIssueIndicator from '@/modules/tasmee/components/TasmeeIssueIndicator.vue'
import { toArabicNumber } from '@/modules/quran/utils/number'

const props = defineProps<{
  issue: TasmeeIssue
}>()

const issueTitle = computed(() => {
  const ayah = `الآية ${toArabicNumber(props.issue.ayah_number)}`

  if (props.issue.category === 'audio') {
    return `${ayah} · الصوت غير واضح`
  }

  const labels: Record<TasmeeIssue['issue_type'], string> = {
    omission: 'حذف كلمة',
    substitution: 'استبدال كلمة',
    insertion: 'إضافة كلمة',
    sequence: 'اختلال ترتيب',
    hesitation: 'تردد',
    transition: 'ملاحظة انتقال',
    audio_uncertain: 'الصوت غير واضح',
  }

  return `${ayah} · ${labels[props.issue.issue_type]}`
})

const meta = computed(() => {
  if (props.issue.category === 'audio') {
    return 'عدم يقين صوتي · لا يُحتسب كخطأ حفظ'
  }

  if (props.issue.category === 'fluency') {
    return 'ملاحظة طلاقة · تحتاج انتباه · لا تعني خطأ حفظ'
  }

  return props.issue.counts_against_hifz
    ? 'خطأ حفظ مرجّح · يخضع لسياسة التحقق قبل تحديث التقدّم'
    : 'ملاحظة حفظ غير مؤكدة · لا تُحتسب تلقائيًا'
})

const comparison = computed(() => {
  const expected = props.issue.expected_text?.trim()
  const observed = props.issue.observed_text?.trim()

  if (expected && observed) {
    return `المتوقع: ${expected} · المسموع: ${observed}`
  }

  if (expected) {
    return `المتوقع: ${expected}`
  }

  if (observed) {
    return `المسموع: ${observed}`
  }

  return ''
})
</script>

<template>
  <article
    dir="rtl"
    class="flex w-full items-start gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-elevated)] px-[var(--sqc-dimension-spacing-12)] py-[var(--sqc-dimension-spacing-12)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div class="min-w-0 flex-1 text-right">
      <h3 class="text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]">
        {{ issueTitle }}
      </h3>
      <p class="mt-[4px] text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]">
        {{ meta }}
      </p>
      <p
        v-if="comparison"
        class="mt-[4px] break-words text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-tertiary)]"
      >
        {{ comparison }}
      </p>
    </div>

    <TasmeeIssueIndicator :issue="issue" />
  </article>
</template>
