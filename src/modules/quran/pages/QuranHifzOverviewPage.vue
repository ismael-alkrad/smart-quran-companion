<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import QuranSurahRow from '@/modules/quran/components/QuranSurahRow.vue'
import {
  type HifzOverviewFilter,
  useHifzOverview,
} from '@/modules/quran/composables'
import {
  BaseAppBar,
  BaseBottomNav,
  BaseButton,
  BaseLoading,
  BaseSearch,
  BaseSegmentedControl,
  type BaseBottomNavRoutes,
  type BaseSegmentedOption,
} from '@/shared/components'

const {
  filteredSurahs,
  queryText,
  filter,
  overallProgress,
  hasNeedsReview,
  loading,
  failed,
  refresh,
} = useHifzOverview()

const router = useRouter()

const filterOptions: BaseSegmentedOption[] = [
  { value: 'all', label: 'الكل' },
  { value: 'memorizing', label: 'قيد الحفظ' },
  { value: 'review', label: 'مراجعة' },
]

const navRoutes: BaseBottomNavRoutes = {
  home: '/home',
  quran: '/quran',
}

function openDailyHifzPlan() {
  void router.push('/quran/hifz/daily-plan')
}

function openSurah(surahNumber: number) {
  void router.push(`/quran/surah/${surahNumber}`)
}

function updateFilter(value: BaseSegmentedOption['value']) {
  if (value === 'all' || value === 'memorizing' || value === 'review') {
    filter.value = value as HifzOverviewFilter
  }
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <main
    dir="rtl"
    class="min-h-dvh w-full bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      v-if="loading && filteredSurahs.length === 0"
      class="grid min-h-[calc(100dvh-76px)] place-items-center px-[16px]"
    >
      <BaseLoading label="جاري تحميل القرآن والحفظ" />
    </div>

    <div
      v-else-if="failed"
      class="flex min-h-[calc(100dvh-76px)] items-center justify-center px-[16px]"
    >
      <div class="flex w-full max-w-[420px] flex-col items-start gap-[16px] text-right">
        <h1
          dir="rtl"
          class="w-full text-right text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          تعذر تحميل تقدم الحفظ
        </h1>

        <p
          dir="rtl"
          class="w-full text-right text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
        >
          تعذر جلب بيانات الحفظ أو بيانات المصحف المحلية. حاول مرة أخرى.
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
        <BaseAppBar title="القرآن والحفظ" />

        <BaseSearch
          v-model="queryText"
          placeholder="ابحث عن سورة"
          aria-label="ابحث عن سورة"
        />

        <BaseSegmentedControl
          :model-value="filter"
          :options="filterOptions"
          aria-label="تصفية السور"
          @update:model-value="updateFilter"
        />

        <QuranProgressCard
          title="مسار الحفظ"
          meta="تابع تقدمك حسب السور والحالات"
          :state="hasNeedsReview ? 'needs-review' : 'on-track'"
          :value="overallProgress"
        />

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          @click="openDailyHifzPlan"
        >
          خطة الحفظ اليومية
        </BaseButton>

        <h2
          dir="rtl"
          class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
        >
          السور
        </h2>

        <div
          v-if="filteredSurahs.length"
          class="flex w-full flex-col items-start gap-[16px]"
        >
          <QuranSurahRow
            v-for="surah in filteredSurahs"
            :key="surah.surahNumber"
            :surah-number="surah.surahNumber"
            :surah-name="surah.surahName"
            :completed-ayahs="surah.completedAyahs"
            :ayah-count="surah.ayahCount"
            :status="surah.status"
            interactive
            @select="openSurah(surah.surahNumber)"
          />
        </div>

        <p
          v-else
          dir="rtl"
          class="w-full py-[32px] text-center text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
        >
          لا توجد سور مطابقة.
        </p>
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
