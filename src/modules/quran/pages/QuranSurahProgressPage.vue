<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import QuranHifzStatusBadge from '@/modules/quran/components/QuranHifzStatusBadge.vue'
import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import QuranStrengthIndicator from '@/modules/quran/components/QuranStrengthIndicator.vue'
import QuranSurahRow from '@/modules/quran/components/QuranSurahRow.vue'
import { useSurahProgress } from '@/modules/quran/composables/useSurahProgress'
import { getHifzStatusLabel } from '@/modules/quran/utils/hifz'
import { toArabicNumber } from '@/modules/quran/utils/number'
import {
  BaseAppBar,
  BaseBanner,
  BaseBottomNav,
  BaseButton,
  BaseLoading,
  type BaseBottomNavRoutes,
} from '@/shared/components'

const route = useRoute()
const router = useRouter()

const surahNumber = Number(route.params.surahNumber)

const {
  progress,
  metadata,
  surahName,
  completedAyahs,
  progressValue,
  needsReview,
  loading,
  failed,
  refresh,
} = useSurahProgress(surahNumber)

const navRoutes: BaseBottomNavRoutes = {
  home: '/home',
  quran: '/quran',
}

const displayStatus = computed(() => progress.value?.status ?? 'new')

const progressMeta = computed(() => {
  if (needsReview.value) {
    return 'هناك أجزاء تحتاج تثبيتًا قبل الانتقال'
  }

  if (!metadata.value) {
    return ''
  }

  return `${toArabicNumber(completedAyahs.value)} من ${toArabicNumber(metadata.value.ayahCount)} آية`
})

function goBack() {
  void router.push('/quran')
}

onMounted(() => {
  if (
    !Number.isInteger(surahNumber)
    || surahNumber < 1
    || surahNumber > 114
  ) {
    void router.replace('/quran')
    return
  }

  void refresh()
})
</script>

<template>
  <main
    dir="rtl"
    class="min-h-dvh w-full bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      v-if="loading && !metadata"
      class="grid min-h-[calc(100dvh-76px)] place-items-center px-[16px]"
    >
      <BaseLoading label="جاري تحميل تقدم السورة" />
    </div>

    <div
      v-else-if="failed || !metadata"
      class="flex min-h-[calc(100dvh-76px)] items-center justify-center px-[16px]"
    >
      <div class="flex w-full max-w-[420px] flex-col items-start gap-[16px] text-right">
        <h1
          dir="rtl"
          class="w-full text-right text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          تعذر تحميل تقدم السورة
        </h1>

        <p
          dir="rtl"
          class="w-full text-right text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
        >
          تعذر جلب بيانات الحفظ أو بيانات السورة المحلية. حاول مرة أخرى.
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
    </div>

    <div
      v-else
      class="min-h-dvh w-full px-[16px] pb-[100px] pt-[24px] sm:px-[24px]"
    >
      <div class="mx-auto flex w-full max-w-[720px] flex-col items-start gap-[16px]">
        <BaseAppBar
          title="تقدم السورة"
          type="back"
          @back="goBack"
        />

        <QuranSurahRow
          :surah-number="surahNumber"
          :surah-name="surahName"
          :completed-ayahs="completedAyahs"
          :ayah-count="metadata.ayahCount"
          :status="displayStatus"
          :progress-text="getHifzStatusLabel(displayStatus)"
        />

        <QuranProgressCard
          title="التقدم الحالي"
          :meta="progressMeta"
          :state="needsReview ? 'needs-review' : 'on-track'"
          :value="progressValue"
        />

        <h2
          dir="rtl"
          class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
        >
          حالة الحفظ
        </h2>

        <QuranHifzStatusBadge :status="displayStatus" />

        <template v-if="progress">
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            قوة الحفظ
          </h2>

          <QuranStrengthIndicator
            kind="memory"
            :level="progress.memory_strength"
          />

          <QuranStrengthIndicator
            kind="transition"
            :level="progress.transition_strength"
          />
        </template>

        <BaseBanner
          title="مؤشران مستقلان"
          body="قوة التذكر وقوة الانتقال بين الآيات تقاسان بشكل منفصل، ولا تمثلان تحليل التجويد."
          tone="info"
          class="!w-full"
        />

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
        >
          ابدأ مراجعة
        </BaseButton>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
        >
          ابدأ تسميع
        </BaseButton>
      </div>
    </div>

    <div class="fixed inset-x-0 bottom-0 z-50">
      <BaseBottomNav
        model-value="quran"
        :routes="navRoutes"
        class="!static"
      />
    </div>
  </main>
</template>
