<script setup lang="ts">
import { useRouter } from 'vue-router'

import {
  HomeLastQuranLocation,
  HomePageScaffold,
  HomeTasmeeCta,
  HomeTodayTaskRow,
} from '@/modules/home'
import type { HomeTodayTaskState } from '@/modules/home/types'
import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import QuranWeakSpotCard from '@/modules/quran/components/QuranWeakSpotCard.vue'

const props = withDefaults(
  defineProps<{
    subtitle: string
    wirdState: HomeTodayTaskState
    hifzState: HomeTodayTaskState
    murajaahState: HomeTodayTaskState
    progressSectionTitle: string
    progressTitle: string
    progressMeta: string
    progressValue?: number
    readingSectionTitle?: string
    attentionSectionTitle?: string
    weakSpotTitle?: string
    weakSpotMetric?: string
    weakSpotLocation?: string
    weakSpotType?: 'ayah' | 'transition' | 'similar-passage'
    showAttention?: boolean
  }>(),
  {
    progressValue: 75,
    readingSectionTitle: 'القراءة',
    attentionSectionTitle: 'يحتاج انتباهًا',
    weakSpotTitle: 'انتقال يحتاج تثبيت',
    weakSpotMetric: 'أولوية مراجعة',
    weakSpotLocation: 'من آخر جلسة مراجعة',
    weakSpotType: 'transition',
    showAttention: true,
  },
)

const router = useRouter()

function resumeQuran() {
  void router.push('/quran/31')
}
</script>

<template>
  <HomePageScaffold :subtitle="subtitle">
    <div
      dir="rtl"
      class="flex flex-col gap-[16px] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-x-[24px]"
    >
      <div
        class="contents lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-[24px]"
      >
        <section class="flex w-full flex-col items-start gap-[16px]">
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            خطة اليوم
          </h2>

          <HomeTodayTaskRow
            type="wird"
            :state="props.wirdState"
          />

          <HomeTodayTaskRow
            type="hifz"
            :state="props.hifzState"
          />

          <HomeTodayTaskRow
            type="murajaah"
            :state="props.murajaahState"
          />
        </section>

        <section class="flex w-full flex-col items-start gap-[16px]">
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            {{ progressSectionTitle }}
          </h2>

          <QuranProgressCard
            :title="progressTitle"
            :meta="progressMeta"
            state="on-track"
            :value="progressValue"
          />
        </section>
      </div>

      <div
        class="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-[24px]"
      >
        <HomeTasmeeCta />

        <section class="flex w-full flex-col items-start gap-[16px]">
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            {{ readingSectionTitle }}
          </h2>

          <HomeLastQuranLocation @resume="resumeQuran" />
        </section>

        <section
          v-if="showAttention"
          class="flex w-full flex-col items-start gap-[16px]"
        >
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            {{ attentionSectionTitle }}
          </h2>

          <QuranWeakSpotCard
            :type="weakSpotType"
            :title="weakSpotTitle"
            :metric="weakSpotMetric"
            :location="weakSpotLocation"
          />
        </section>
      </div>
    </div>
  </HomePageScaffold>
</template>
