<script setup lang="ts">
import { useRouter } from 'vue-router'

import {
  HomeLastQuranLocation,
  HomeTasmeeCta,
  HomeTodayTaskRow,
} from '@/modules/home'
import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import QuranWeakSpotCard from '@/modules/quran/components/QuranWeakSpotCard.vue'
import {
  BaseAvatar,
  BaseBottomNav,
  type BaseBottomNavRoutes,
} from '@/shared/components'

const router = useRouter()

const navRoutes: BaseBottomNavRoutes = {
  home: '/home',
  quran: '/quran/31',
}

function resumeQuran() {
  void router.push('/quran/31')
}
</script>

<template>
  <main
    dir="rtl"
    class="min-h-dvh w-full bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div class="relative mx-auto h-dvh w-full max-w-[390px] overflow-hidden">
      <div
        class="absolute inset-x-0 bottom-[76px] top-[24px] flex flex-col items-start gap-[16px] overflow-x-hidden overflow-y-auto px-[16px] pb-[24px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <header
          dir="ltr"
          class="flex h-[64px] w-full shrink-0 items-center justify-between overflow-hidden"
        >
          <BaseAvatar
            type="placeholder"
            size="medium"
            aria-label="صورة الحساب"
          />

          <div
            dir="rtl"
            class="flex shrink-0 flex-col items-end gap-[2px] overflow-hidden text-right"
          >
            <h1
              dir="auto"
              class="whitespace-nowrap text-[24px] font-semibold leading-[36px] text-[color:var(--sqc-color-text-primary)]"
            >
              السلام عليكم
            </h1>

            <p
              dir="auto"
              class="whitespace-nowrap text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
            >
              هذه خطتك القرآنية لليوم
            </p>
          </div>
        </header>

        <h2
          dir="auto"
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

        <h2
          dir="auto"
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

        <HomeTasmeeCta />

        <h2
          dir="auto"
          class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
        >
          القراءة
        </h2>

        <HomeLastQuranLocation @resume="resumeQuran" />

        <h2
          dir="auto"
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
      </div>

      <BaseBottomNav
        model-value="home"
        :routes="navRoutes"
        class="absolute inset-x-0 bottom-0"
      />
    </div>
  </main>
</template>
