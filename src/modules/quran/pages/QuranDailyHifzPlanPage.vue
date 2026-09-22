<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  useStartHifzDailyAssignmentMutation,
} from '@/modules/quran/api'
import QuranHifzStatusBadge from '@/modules/quran/components/QuranHifzStatusBadge.vue'
import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import QuranStrengthIndicator from '@/modules/quran/components/QuranStrengthIndicator.vue'
import QuranSurahRow from '@/modules/quran/components/QuranSurahRow.vue'
import { useDailyHifzPlan } from '@/modules/quran/composables/useDailyHifzPlan'
import { getMushafPageNumberForAyah } from '@/modules/quran/repositories/quran.repository'
import { getHifzStatusLabel } from '@/modules/quran/utils/hifz'
import {
  BaseAppBar,
  BaseBanner,
  BaseBottomNav,
  BaseButton,
  BaseLoading,
  type BaseBottomNavRoutes,
} from '@/shared/components'

const router = useRouter()
const openingReader = ref(false)
const startFailed = ref(false)
const startHifzCall = useStartHifzDailyAssignmentMutation()

const {
  plan,
  metadata,
  surahName,
  progressValue,
  assignmentStatus,
  loading,
  failed,
  refresh,
} = useDailyHifzPlan()

const navRoutes: BaseBottomNavRoutes = {
  home: '/home',
  quran: '/quran',
}

function goBack() {
  void router.push('/quran')
}

function openSurahProgress() {
  const surahNumber = plan.value?.assignment?.surah_number

  if (!surahNumber) return

  void router.push(`/quran/surah/${surahNumber}`)
}

function openTasmeeSetup() {
  const assignment = plan.value?.assignment

  if (!assignment) return

  void router.push({
    name: 'tasmee-solo-setup',
    query: {
      assignment: assignment.name,
    },
  })
}

const primaryActionLabel = computed(() => {
  switch (assignmentStatus.value) {
    case 'memorizing':
      return 'متابعة الحفظ'
    case 'pending_tasmee':
      return 'ابدأ التسميع'
    case 'pending_approval':
      return 'بانتظار الاعتماد'
    case 'approved':
    case 'mastered':
      return 'تم اعتماد الحفظ'
    case 'needs_review':
      return 'إعادة التسميع'
    default:
      return 'ابدأ الحفظ'
  }
})

const primaryActionDisabled = computed(() =>
  assignmentStatus.value === 'pending_approval'
  || assignmentStatus.value === 'approved'
  || assignmentStatus.value === 'mastered',
)

function handlePrimaryAction() {
  if (
    assignmentStatus.value === 'pending_tasmee'
    || assignmentStatus.value === 'needs_review'
  ) {
    openTasmeeSetup()
    return
  }

  if (primaryActionDisabled.value) return

  void startHifz()
}

async function openAssignmentReader() {
  const assignment = plan.value?.assignment

  if (!assignment || openingReader.value) return

  openingReader.value = true
  startFailed.value = false

  try {
    await openAssignmentReader()
  } catch {
    startFailed.value = true
  } finally {
    openingReader.value = false
  }
}

async function reviewBeforeTasmee() {
  await openAssignmentReader()
}

async function startHifz() {
  const assignment = plan.value?.assignment

  if (!assignment || openingReader.value) return

  openingReader.value = true
  startFailed.value = false

  try {
    await startHifzCall.submit({
      assignment_name: assignment.name,
    })

    const pageNumber = await getMushafPageNumberForAyah(
      assignment.surah_number,
      assignment.start_ayah,
    )

    await router.push({
      path: `/quran/${pageNumber}`,
      query: {
        mode: 'hifz',
        assignment: assignment.name,
        surah: String(assignment.surah_number),
        startAyah: String(assignment.start_ayah),
        endAyah: String(assignment.end_ayah),
      },
    })
  } catch {
    startFailed.value = true
  } finally {
    openingReader.value = false
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
      v-if="loading && !plan"
      class="grid min-h-[calc(100dvh-76px)] place-items-center px-[16px]"
    >
      <BaseLoading label="جاري تحميل خطة الحفظ اليومية" />
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
          تعذر تحميل خطة الحفظ
        </h1>

        <p
          dir="rtl"
          class="w-full text-right text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
        >
          تعذر جلب مهمة الحفظ اليومية. حاول مرة أخرى.
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
      v-else-if="plan && !plan.assignment"
      class="min-h-dvh w-full px-[16px] pb-[100px] pt-[24px] sm:px-[24px]"
    >
      <div class="mx-auto flex w-full max-w-[720px] flex-col items-start gap-[16px]">
        <BaseAppBar
          title="خطة الحفظ اليومية"
          type="back"
          @back="goBack"
        />

        <div class="flex w-full flex-col items-start gap-[8px] rounded-[var(--sqc-dimension-radius-16)] bg-[var(--sqc-color-background-elevated)] p-[var(--sqc-dimension-spacing-20)] text-right">
          <h2
            dir="rtl"
            class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
          >
            لا توجد مهمة حفظ لليوم
          </h2>

          <p
            dir="rtl"
            class="w-full text-right text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
          >
            ستظهر مهمة الحفظ هنا عندما تُحدد ضمن خطتك اليومية.
          </p>
        </div>
      </div>
    </div>

    <div
      v-else-if="plan && plan.assignment && metadata"
      class="min-h-dvh w-full px-[16px] pb-[100px] pt-[24px] sm:px-[24px]"
    >
      <div class="mx-auto flex w-full max-w-[720px] flex-col items-start gap-[16px]">
        <BaseAppBar
          title="خطة الحفظ اليومية"
          type="back"
          @back="goBack"
        />

        <QuranProgressCard
          title="حفظ اليوم"
          meta="مهمة اليوم محددة من خطتك الشخصية"
          state="on-track"
          :value="progressValue"
        />

        <h2
          dir="rtl"
          class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
        >
          المهمة
        </h2>

        <QuranSurahRow
          :surah-number="plan.assignment.surah_number"
          :surah-name="surahName"
          :completed-ayahs="0"
          :ayah-count="metadata.ayahCount"
          :status="assignmentStatus"
          :progress-text="getHifzStatusLabel(assignmentStatus)"
          interactive
          @select="openSurahProgress"
        />

        <QuranHifzStatusBadge :status="assignmentStatus" />

        <BaseBanner
          title="خطوة اليوم"
          body="اقرأ المقطع من المصحف المعتمد، ثبّت الحفظ، ثم انتقل إلى التسميع عندما تصبح مستعدًا."
          tone="info"
          class="!w-full"
        />

        <h2
          dir="rtl"
          class="w-full text-right text-[18px] font-medium leading-[28px] text-[color:var(--sqc-color-text-primary)]"
        >
          قوة التذكر الحالية
        </h2>

        <QuranStrengthIndicator
          kind="memory"
          :level="plan.progress?.memory_strength ?? null"
        />

        <BaseButton
          v-if="
            assignmentStatus === 'pending_tasmee'
            || assignmentStatus === 'needs_review'
          "
          size="large"
          variant="secondary"
          class="w-full"
          :loading="openingReader"
          loading-text="جاري فتح المقطع"
          @click="reviewBeforeTasmee"
        >
          مراجعة قبل التسميع
        </BaseButton>

        <p
          v-if="startFailed"
          dir="rtl"
          class="w-full text-right text-[12px] font-medium leading-[20px] text-[color:var(--sqc-color-status-error)]"
        >
          تعذر بدء جلسة الحفظ. حاول مرة أخرى.
        </p>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          :disabled="primaryActionDisabled"
          :loading="openingReader"
          loading-text="جاري فتح موضع الحفظ"
          @click="handlePrimaryAction"
        >
          {{ primaryActionLabel }}
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
