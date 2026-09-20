<script setup lang="ts">
import { computed, onMounted } from 'vue'

import HomeDayOverview from '@/modules/home/components/HomeDayOverview.vue'
import HomeNewUserPage from '@/modules/home/pages/HomeNewUserPage.vue'
import { useHomeSummary } from '@/modules/home/composables'
import type {
  HomeTodayTaskState,
  HomeTodayTaskType,
} from '@/modules/home/types'
import { BaseButton, BaseLoading } from '@/shared/components'

const {
  summary,
  loading,
  failed,
  refresh,
} = useHomeSummary()

onMounted(() => {
  void refresh()
})

const progressValue = computed(() => {
  const plan = summary.value?.plan

  if (!plan || plan.total_tasks <= 0) {
    return 0
  }

  return Math.round(
    (plan.completed_tasks / plan.total_tasks) * 100,
  )
})

const copy = computed(() => {
  const state = summary.value?.view_state

  if (state === 'active') {
    return {
      subtitle: 'أكمل ما بدأت اليوم بهدوء',
      progressSectionTitle: 'التقدم الحالي',
      progressTitle: 'تقدم اليوم',
      progressMeta: 'أنجزت جزءًا من خطتك، أكمل على نفس الوتيرة',
      readingSectionTitle: 'القراءة',
      attentionSectionTitle: 'مراجعة ذكية',
    }
  }

  if (state === 'completed') {
    return {
      subtitle: 'أنجزت خطتك القرآنية لهذا اليوم',
      progressSectionTitle: 'إغلاق اليوم',
      progressTitle: 'خطة اليوم مكتملة',
      progressMeta: 'تم إنجاز الورد والحفظ والمراجعة',
      readingSectionTitle: 'آخر موضع',
      attentionSectionTitle: 'مراجعة ذكية',
    }
  }

  return {
    subtitle: 'هذه خطتك القرآنية لليوم',
    progressSectionTitle: 'التقدم',
    progressTitle: 'تقدمك القرآني',
    progressMeta: 'تابع خطتك اليومية بثبات',
    readingSectionTitle: 'القراءة',
    attentionSectionTitle: 'يحتاج انتباهًا',
  }
})

function taskState(type: HomeTodayTaskType): HomeTodayTaskState {
  return (
    summary.value?.plan.tasks.find(
      task => task.type === type,
    )?.state ?? 'pending'
  )
}
</script>

<template>
  <main
    v-if="loading && !summary"
    dir="rtl"
    class="grid min-h-dvh w-full place-items-center bg-[var(--sqc-color-background-primary)] px-[16px] [font-family:var(--sqc-font-family-ui)]"
  >
    <BaseLoading label="جاري تحميل الصفحة الرئيسية" />
  </main>

  <main
    v-else-if="failed || !summary"
    dir="rtl"
    class="flex min-h-dvh w-full items-center justify-center bg-[var(--sqc-color-background-primary)] px-[16px] [font-family:var(--sqc-font-family-ui)]"
  >
    <div class="flex w-full max-w-[420px] flex-col items-start gap-[16px] text-right">
      <h1
        class="w-full text-[20px] font-semibold leading-[32px] text-[color:var(--sqc-color-text-primary)]"
      >
        تعذر تحميل الصفحة الرئيسية
      </h1>

      <p
        class="w-full text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
      >
        تعذر جلب بيانات خطتك الآن. حاول مرة أخرى.
      </p>

      <BaseButton
        size="large"
        variant="primary"
        class="w-full"
        :loading="loading"
        loading-text="جاري المحاولة"
        @click="refresh"
      >
        إعادة المحاولة
      </BaseButton>
    </div>
  </main>

  <HomeNewUserPage
    v-else-if="summary.view_state === 'new_user'"
  />

  <HomeDayOverview
    v-else
    :subtitle="copy.subtitle"
    :wird-state="taskState('wird')"
    :hifz-state="taskState('hifz')"
    :murajaah-state="taskState('murajaah')"
    :progress-section-title="copy.progressSectionTitle"
    :progress-title="copy.progressTitle"
    :progress-meta="copy.progressMeta"
    :progress-value="progressValue"
    :reading-section-title="copy.readingSectionTitle"
    :attention-section-title="copy.attentionSectionTitle"
    :show-reading="summary.reading !== null"
    :show-attention="summary.weak_spot !== null"
  />
</template>
