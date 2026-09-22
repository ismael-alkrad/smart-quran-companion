<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import TasmeeStateHeader from '@/modules/tasmee/components/TasmeeStateHeader.vue'
import { useTasmeeDailyAssignment } from '@/modules/tasmee/composables/useTasmeeDailyAssignment'
import {
  getLatestTasmeeRecordingForAssignment,
} from '@/modules/tasmee/repositories/tasmeeRecording.repository'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
  BaseLoading,
  BaseSearch,
} from '@/shared/components'

const router = useRouter()
const checkingResume = ref(false)
const resumeCheckedFor = ref('')

const {
  assignment,
  surahName,
  sessionMeta,
  loading,
  failed,
  error,
  refresh,
} = useTasmeeDailyAssignment()

const selectedSurahLabel = computed(() =>
  surahName.value ? `سورة ${surahName.value}` : '',
)

function goBack() {
  void router.push('/quran/hifz/daily-plan')
}

function openMicCheck() {
  const current = assignment.value
  if (!current) return

  void router.push({
    name: 'tasmee-solo-mic-check',
    query: {
      assignment: current.name,
    },
  })
}


async function resumeStoredSession(assignmentName: string) {
  if (
    checkingResume.value
    || resumeCheckedFor.value === assignmentName
  ) {
    return
  }

  checkingResume.value = true
  resumeCheckedFor.value = assignmentName

  try {
    const stored = await getLatestTasmeeRecordingForAssignment(
      assignmentName,
    )

    if (!stored) return

    await router.replace({
      name: 'tasmee-solo-session',
      params: {
        recordingId: stored.id,
      },
      query: {
        assignment: assignmentName,
      },
    })
  } finally {
    checkingResume.value = false
  }
}

watch(
  () => assignment.value?.name ?? '',
  (assignmentName) => {
    if (!assignmentName) return
    void resumeStoredSession(assignmentName)
  },
  { immediate: true },
)
</script>

<template>
  <main
    dir="rtl"
    class="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col gap-[var(--sqc-dimension-spacing-16)] bg-[var(--sqc-color-background-primary)] px-[var(--sqc-dimension-spacing-16)] py-[var(--sqc-dimension-spacing-24)] [font-family:var(--sqc-font-family-ui)]"
  >
    <BaseAppBar
      type="back"
      title="التسميع الفردي"
      class="shrink-0"
      @back="goBack"
    />

    <div
      v-if="loading || checkingResume"
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
        state="preparing"
        title="تهيئة جلسة التسميع"
        subtitle="تم اختيار مهمة الحفظ اليومية. راجع النطاق ثم افحص الميكروفون."
      />

      <BaseSearch
        :model-value="selectedSurahLabel"
        placeholder="ابحث عن سورة"
        aria-label="السورة المحددة للتسميع"
        disabled
      />

      <QuranProgressCard
        title="نطاق التسميع"
        :meta="sessionMeta"
        :value="0"
      />

      <BaseBanner
        tone="info"
        title="الخصوصية أولًا"
        body="سيطلب التطبيق إذن الميكروفون عند الحاجة، ويمكنك مراجعة الإذن قبل بدء الجلسة."
      />

      <div class="min-h-[16px] flex-1" />

      <BaseButton
        size="large"
        variant="primary"
        class="w-full"
        @click="openMicCheck"
      >
        فحص الميكروفون
      </BaseButton>
    </template>
  </main>
</template>
