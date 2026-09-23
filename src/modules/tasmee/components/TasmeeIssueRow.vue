<script setup lang="ts">
import { computed } from 'vue'

import type {
  TasmeeIssue,
  TasmeeIssueReviewState,
} from '@/modules/tasmee/api'
import TasmeeIssueIndicator from '@/modules/tasmee/components/TasmeeIssueIndicator.vue'
import { toArabicNumber } from '@/modules/quran/utils/number'

const props = withDefaults(defineProps<{
  issue: TasmeeIssue
  reviewing?: boolean
  reviewError?: string
}>(), {
  reviewing: false,
  reviewError: '',
})

const emit = defineEmits<{
  review: [state: Extract<TasmeeIssueReviewState, 'confirmed' | 'dismissed'>]
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

  return props.issue.reviewable
    ? 'ملاحظة حفظ محتملة · تحتاج تأكيدك قبل أن تُستخدم كنتيجة موثوقة'
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

const reviewState = computed(
  () => props.issue.review?.state ?? 'pending',
)

const reviewStatusText = computed(() => {
  if (reviewState.value === 'confirmed') {
    return 'أكدت أن هذه الملاحظة تمثل خطأً في القراءة.'
  }

  if (reviewState.value === 'dismissed') {
    return 'أكدت أن قراءتك كانت صحيحة في هذا الموضع.'
  }

  return 'هل حدث هذا الخطأ فعلًا أثناء التسميع؟'
})

function reviewButtonClasses(
  state: Extract<TasmeeIssueReviewState, 'confirmed' | 'dismissed'>,
) {
  const active = reviewState.value === state

  if (state === 'confirmed') {
    return active
      ? 'border-[color:var(--sqc-color-potentialissue-substitution-foreground,#b91c1c)] bg-[var(--sqc-color-potentialissue-substitution-background,#fef2f2)] text-[color:var(--sqc-color-potentialissue-substitution-foreground,#b91c1c)]'
      : 'border-[color:var(--sqc-color-border-default,#d6d9df)] bg-[var(--sqc-color-background-primary)] text-[color:var(--sqc-color-text-primary)]'
  }

  return active
    ? 'border-[color:var(--sqc-color-status-success,#237a63)] bg-[var(--sqc-color-toast-success-background,#f0f8f6)] text-[color:var(--sqc-color-status-success,#237a63)]'
    : 'border-[color:var(--sqc-color-border-default,#d6d9df)] bg-[var(--sqc-color-background-primary)] text-[color:var(--sqc-color-text-primary)]'
}
</script>

<template>
  <article
    dir="rtl"
    class="flex w-full flex-col gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-elevated)] px-[var(--sqc-dimension-spacing-12)] py-[var(--sqc-dimension-spacing-12)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div class="flex w-full items-start gap-[var(--sqc-dimension-spacing-12)]">
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
    </div>

    <div
      v-if="issue.reviewable"
      class="flex w-full flex-col gap-[8px] border-t border-[color:var(--sqc-color-border-default,#e5e7eb)] pt-[10px]"
    >
      <p
        class="text-right text-[12px] font-medium leading-[20px]"
        :class="reviewState === 'confirmed'
          ? 'text-[color:var(--sqc-color-potentialissue-substitution-foreground,#b91c1c)]'
          : reviewState === 'dismissed'
            ? 'text-[color:var(--sqc-color-status-success,#237a63)]'
            : 'text-[color:var(--sqc-color-text-secondary)]'"
      >
        {{ reviewStatusText }}
      </p>

      <div class="grid grid-cols-2 gap-[8px]">
        <button
          type="button"
          class="min-h-[42px] rounded-[var(--sqc-dimension-radius-10,10px)] border px-[10px] text-[12px] font-semibold leading-[18px] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          :class="reviewButtonClasses('confirmed')"
          :disabled="reviewing"
          @click="emit('review', 'confirmed')"
        >
          نعم، كان عندي خطأ
        </button>

        <button
          type="button"
          class="min-h-[42px] rounded-[var(--sqc-dimension-radius-10,10px)] border px-[10px] text-[12px] font-semibold leading-[18px] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          :class="reviewButtonClasses('dismissed')"
          :disabled="reviewing"
          @click="emit('review', 'dismissed')"
        >
          لا، قراءتي كانت صحيحة
        </button>
      </div>

      <p
        v-if="reviewing"
        class="text-right text-[11px] leading-[18px] text-[color:var(--sqc-color-text-tertiary)]"
      >
        جارٍ حفظ اختيارك…
      </p>

      <p
        v-else-if="reviewError"
        class="text-right text-[11px] leading-[18px] text-[color:var(--sqc-color-status-error,#b91c1c)]"
      >
        {{ reviewError }}
      </p>
    </div>
  </article>
</template>
