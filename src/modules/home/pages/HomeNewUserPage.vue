<script setup lang="ts">
import { useRouter } from 'vue-router'

import {
  HomeTasmeeCta,
  HomeTodayTaskRow,
} from '@/modules/home'
import {
  BaseAvatar,
  BaseBottomNav,
  BaseEmptyState,
  type BaseBottomNavRoutes,
} from '@/shared/components'

const router = useRouter()

const navRoutes: BaseBottomNavRoutes = {
  home: '/home',
  quran: '/quran/31',
}

function exploreQuran() {
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
        class="absolute inset-x-0 bottom-[76px] top-[24px] flex flex-col items-start gap-[16px] overflow-x-hidden overflow-y-auto px-[16px] pb-[24px]"
      >
        <header
          class="flex h-[64px] w-full shrink-0 items-center justify-between overflow-hidden"
        >
          <BaseAvatar
            type="placeholder"
            size="medium"
            aria-label="صورة الحساب"
          />

          <div class="flex shrink-0 flex-col items-end gap-[2px] overflow-hidden text-right">
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
              ابدأ بخطة بسيطة ويمكنك تعديلها لاحقًا
            </p>
          </div>
        </header>

        <BaseEmptyState
          title="ابدأ رحلتك القرآنية"
          body="حدد وردك اليومي والحفظ والمراجعة، وسنبني لك تقدمًا واضحًا مع الوقت."
          action-label="استكشاف"
          class="!w-full"
          @action="exploreQuran"
        />

        <h2
          dir="auto"
          class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
        >
          خطة البداية
        </h2>

        <HomeTodayTaskRow
          type="wird"
          state="pending"
        />

        <HomeTodayTaskRow
          type="hifz"
          state="pending"
        />

        <HomeTodayTaskRow
          type="murajaah"
          state="pending"
        />

        <HomeTasmeeCta />
      </div>

      <BaseBottomNav
        model-value="home"
        :routes="navRoutes"
        class="absolute inset-x-0 bottom-0"
      />
    </div>
  </main>
</template>
