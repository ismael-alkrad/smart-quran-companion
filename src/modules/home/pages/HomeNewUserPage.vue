<script setup lang="ts">
import { useRouter } from 'vue-router'

import {
  HomePageScaffold,
  HomeTasmeeCta,
  HomeTodayTaskRow,
} from '@/modules/home'
import { BaseEmptyState } from '@/shared/components'

const router = useRouter()

function exploreQuran() {
  void router.push('/quran/31')
}
</script>

<template>
  <HomePageScaffold subtitle="ابدأ بخطة بسيطة ويمكنك تعديلها لاحقًا">
    <div
      dir="ltr"
      class="flex flex-col gap-[16px] lg:grid lg:grid-cols-[416px_minmax(0,760px)] lg:items-start lg:gap-x-[24px] lg:gap-y-[24px]"
    >
      <BaseEmptyState
        dir="rtl"
        title="ابدأ رحلتك القرآنية"
        body="حدد وردك اليومي والحفظ والمراجعة، وسنبني لك تقدمًا واضحًا مع الوقت."
        action-label="استكشاف"
        class="!w-full lg:col-start-1 lg:row-start-1"
        @action="exploreQuran"
      />

      <section
        dir="rtl"
        class="flex w-full flex-col items-end gap-[16px] lg:col-start-2 lg:row-span-2 lg:row-start-1"
      >
        <h2
          dir="rtl"
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
      </section>

      <HomeTasmeeCta
        dir="rtl"
        class="lg:col-start-1 lg:row-start-2"
      />
    </div>
  </HomePageScaffold>
</template>
