<script setup lang="ts">
import { useRouter } from 'vue-router'

import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import TasmeeAudioQuality from '@/modules/tasmee/components/TasmeeAudioQuality.vue'
import TasmeeStateHeader from '@/modules/tasmee/components/TasmeeStateHeader.vue'
import { useTasmeeDailyAssignment } from '@/modules/tasmee/composables/useTasmeeDailyAssignment'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
  BaseLoading,
} from '@/shared/components'

const router = useRouter()

const {
  assignment,
  sessionMeta,
  loading,
  failed,
  error,
  refresh,
} = useTasmeeDailyAssignment()

function goBack() {
  const current = assignment.value

  void router.push({
    name: 'tasmee-solo-mic-check',
    query: current
      ? { assignment: current.name }
      : {},
  })
}


function startTasmee() {
  const current = assignment.value
  if (!current) return

  void router.push({
    name: 'tasmee-solo-live',
    query: {
      assignment: current.name,
    },
  })
}
</script>

<template>
  <main
    dir="rtl"
    class="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col gap-[var(--sqc-dimension-spacing-16)] bg-[var(--sqc-color-background-primary)] px-[var(--sqc-dimension-spacing-16)] py-[var(--sqc-dimension-spacing-24)] [font-family:var(--sqc-font-family-ui)]"
  >
    <BaseAppBar
      type="back"
      title="جاهز للتسميع"
      class="shrink-0"
      @back="goBack"
    />

    <div
      v-if="loading"
      class="grid flex-1 place-items-center"
    >
      <BaseLoading label="جاري تجهيز جلسة التسميع" />
    </div>

    <section
      v-else-if="failed || !assignment"
      class="flex flex-1 flex-col justify-center gap-[var(--sqc-dimension-spacing-16)]"
    >
      <BaseBanner
        tone="error"
        title="تعذر تجهيز جلسة التسميع"
        :body="
          error instanceof Error
            ? error.message
            : 'تعذر العثور على مهمة الحفظ المرتبطة بهذه الجلسة.'
        "
      />

      <BaseButton
        size="large"
        variant="secondary"
        class="w-full"
        @click="refresh"
      >
        إعادة المحاولة
      </BaseButton>
    </section>

    <template v-else>
      <TasmeeStateHeader
        state="ready"
        title="كل شيء جاهز"
        subtitle="ابدأ عندما تكون مستعدًا؛ يمكنك الإيقاف المؤقت في أي وقت."
      />

      <QuranProgressCard
        title="نطاق الجلسة"
        :meta="sessionMeta"
        :value="0"
      />

      <div
        dir="rtl"
        class="inline-flex w-fit items-center gap-[var(--sqc-dimension-spacing-8)] rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-ai-active-background)] px-[var(--sqc-dimension-spacing-12)] py-[var(--sqc-dimension-spacing-8)] text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-ai-active-foreground)]"
      >
        <span
          aria-hidden="true"
          class="size-[8px] shrink-0 rounded-full bg-[var(--sqc-color-ai-active-foreground)]"
        />
        المساعد الذكي جاهز
      </div>

      <TasmeeAudioQuality state="good" />

      <BaseBanner
        tone="info"
        title="واجهة القارئ هادئة"
        body="أثناء القراءة لن تظهر لك مؤشرات الأخطاء أو الملاحظات حتى لا تتشتت."
      />

      <div class="min-h-[16px] flex-1" />

      <BaseButton
        size="large"
        variant="primary"
        class="w-full"
        @click="startTasmee"
      >
        ابدأ التسميع
      </BaseButton>
    </template>
  </main>
</template>
