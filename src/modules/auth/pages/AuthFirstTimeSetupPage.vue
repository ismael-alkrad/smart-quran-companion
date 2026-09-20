<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthActions, AuthIntro } from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseSegmentedControl,
  type BaseSegmentedOption,
} from '@/shared/components'

const router = useRouter()

const focus = ref<BaseSegmentedOption['value']>('both')
const pace = ref<BaseSegmentedOption['value']>('balanced')

const focusOptions: BaseSegmentedOption[] = [
  { value: 'hifz', label: 'حفظ' },
  { value: 'review', label: 'مراجعة' },
  { value: 'both', label: 'الاثنان' },
]

const paceOptions: BaseSegmentedOption[] = [
  { value: 'light', label: 'خفيف' },
  { value: 'balanced', label: 'متوازن' },
  { value: 'intensive', label: 'مكثف' },
]

function goBack() {
  void router.push('/auth/account-ready')
}
</script>

<template>
  <main
    dir="rtl"
    class="min-h-dvh w-full bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div class="mx-auto min-h-dvh w-full max-w-[390px] px-[16px] py-[24px]">
      <div
        class="flex min-h-[calc(100dvh-48px)] w-full flex-col items-end gap-[20px] overflow-hidden pb-[24px]"
      >
        <BaseAppBar
          type="back"
          title="إعداد البداية"
          back-label="رجوع"
          @back="goBack"
        />

        <AuthIntro
          title="خلّينا نضبط خطتك"
          description="اختيارات البداية تساعدنا على ترتيب Home والمراجعة. يمكنك تغييرها لاحقًا من الإعدادات."
        />

        <section class="flex w-full flex-col items-end gap-[8px] overflow-hidden">
          <h2
            dir="auto"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            ما الذي تريد التركيز عليه؟
          </h2>

          <BaseSegmentedControl
            v-model="focus"
            :options="focusOptions"
            aria-label="اختيار تركيز خطة البداية"
          />
        </section>

        <section class="flex w-full flex-col items-end gap-[8px] overflow-hidden">
          <h2
            dir="auto"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            الإيقاع اليومي
          </h2>

          <BaseSegmentedControl
            v-model="pace"
            :options="paceOptions"
            aria-label="اختيار الإيقاع اليومي"
          />
        </section>

        <p
          dir="auto"
          class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-tertiary)]"
        >
          لن نستخدم هذه الخيارات كدرجات أو ضغط؛ فقط لترتيب الخطة اليومية.
        </p>

        <AuthActions primary-label="ابدأ الاستخدام" />
      </div>
    </div>
  </main>
</template>
