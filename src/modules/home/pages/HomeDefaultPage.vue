<script setup lang="ts">
import { useRouter } from 'vue-router'

import {
  HomeLastQuranLocation,
  HomePageScaffold,
  HomeTasmeeCta,
  HomeTodayTaskRow,
} from '@/modules/home'
import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import QuranWeakSpotCard from '@/modules/quran/components/QuranWeakSpotCard.vue'

const router = useRouter()

function resumeQuran() {
  void router.push('/quran/31')
}
</script>

<template>
  <HomePageScaffold subtitle="هذه خطتك القرآنية لليوم">
    <div
      dir="rtl"
      class="flex flex-col gap-[16px] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-x-[24px]"
    >
      <div
        class="contents lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-[24px]"
      >
        <section
          class="flex w-full flex-col items-start gap-[16px]"
        >
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            خطة اليوم
          </h2>

          <HomeTodayTaskRow
            type="wird"
            state="active"
          />

          <HomeTodayTaskRow
            type="hifz"
            state="pending"
          />

          <HomeTodayTaskRow
            type="murajaah"
            state="pending"
          />
        </section>

        <section
          class="flex w-full flex-col items-start gap-[16px]"
        >
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            التقدم
          </h2>

          <QuranProgressCard
            title="تقدمك القرآني"
            meta="تابع خطتك اليومية بثبات"
            state="on-track"
            :value="75"
          />
        </section>
      </div>

      <div
        class="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-[24px]"
      >
        <HomeTasmeeCta dir="rtl" />

        <section
          class="flex w-full flex-col items-start gap-[16px]"
        >
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            القراءة
          </h2>

          <HomeLastQuranLocation @resume="resumeQuran" />
        </section>

        <section
          class="flex w-full flex-col items-start gap-[16px]"
        >
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            يحتاج انتباهًا
          </h2>

          <QuranWeakSpotCard
            type="transition"
            title="انتقال يحتاج تثبيت"
            metric="أولوية مراجعة"
            location="من آخر جلسة مراجعة"
          />
        </section>
      </div>
    </div>
  </HomePageScaffold>
</template>
