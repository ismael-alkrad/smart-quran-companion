<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  getTasmeeSession,
  uploadTasmeeRecording,
  useCreateTasmeeSessionMutation,
  useStartTasmeeAnalysisMutation,
  type TasmeeSession,
} from '@/modules/tasmee/api'
import TasmeeSessionTimer from '@/modules/tasmee/components/TasmeeSessionTimer.vue'
import TasmeeStateHeader from '@/modules/tasmee/components/TasmeeStateHeader.vue'
import TasmeeVerificationBadge from '@/modules/tasmee/components/TasmeeVerificationBadge.vue'
import {
  getTasmeeRecording,
  updateTasmeeRecording,
  type StoredTasmeeRecording,
} from '@/modules/tasmee/repositories/tasmeeRecording.repository'
import { useEnsureHifzDailyAssignmentMutation } from '@/modules/quran/api'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { toArabicNumber } from '@/modules/quran/utils/number'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
  BaseLoading,
} from '@/shared/components'

type PostRecordingState =
  | 'loading'
  | 'ended'
  | 'uploading'
  | 'upload-failed'
  | 'uploaded'
  | 'analyzing'
  | 'analysis-pending'
  | 'analysis-failed'
  | 'report-ready'
  | 'missing'

const route = useRoute()
const router = useRouter()
const createSessionCall = useCreateTasmeeSessionMutation()
const startAnalysisCall = useStartTasmeeAnalysisMutation()
const dailyPlanCall = useEnsureHifzDailyAssignmentMutation()

const state = ref<PostRecordingState>('loading')
const recording = ref<StoredTasmeeRecording | null>(null)
const uploadError = ref('')
const analysisErrorCode = ref('')
const analysisErrorMessage = ref('')

let analysisPollTimer = 0

const recordingId = computed(() => {
  const value = route.params.recordingId

  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return typeof value === 'string'
    ? value
    : ''
})

const analysisErrorText = computed(() => {
  if (analysisErrorCode.value === 'transcription_failed') {
    return 'تعذر تحويل التسجيل إلى نص. التسجيل مرفوع ومحفوظ ويمكن إعادة التحليل بعد تشغيل خدمة التعرف الصوتي.'
  }

  if (analysisErrorCode.value === 'transcription_not_configured') {
    return 'خدمة التعرف الصوتي غير مهيأة بعد. التسجيل مرفوع ومحفوظ ولن تحتاج إلى رفعه من جديد.'
  }

  if (analysisErrorCode.value === 'alignment_failed') {
    return 'تم تحويل التسجيل إلى نص، لكن تعذرت محاذاته مع النص القرآني المرجعي. التسجيل والنص محفوظان ويمكن إعادة المحاولة.'
  }

  if (analysisErrorCode.value === 'classification_not_configured') {
    return 'تم تحويل الصوت إلى نص ومحاذاة كلمات القرآن بنجاح. الخطوة التالية هي تصنيف الملاحظات قبل إنشاء التقرير.'
  }

  if (analysisErrorCode.value === 'alignment_not_configured') {
    return 'تم التعرف على الصوت وتحويله إلى نص بنجاح. الخطوة التالية هي محاذاة كلمات القرآن.'
  }

  if (analysisErrorCode.value === 'recording_not_ready') {
    return 'تعذر تجهيز التسجيل للتحليل. التسجيل محفوظ وسنراجع بيانات الملف قبل إعادة المحاولة.'
  }

  return analysisErrorMessage.value
    || 'تعذر إكمال التحليل تقنيًا. التسجيل المرفوع ما يزال محفوظًا.'
})

const sessionMeta = computed(() => {
  const current = recording.value

  if (!current) return ''

  const surahName = getSurahNameArabic(current.surahNumber)
  const ayahRange = current.startAyah === current.endAyah
    ? `الآية ${toArabicNumber(current.startAyah)}`
    : `الآيات ${toArabicNumber(current.startAyah)}–${toArabicNumber(current.endAyah)}`

  return `سورة ${surahName} · ${ayahRange} · ${formatDuration(current.durationSeconds)}`
})

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.trunc(seconds))
  const minutes = Math.floor(total / 60)
  const remainingSeconds = total % 60

  return `${toArabicNumber(minutes)}:${String(remainingSeconds).padStart(2, '0')}`
}

function recordingFileExtension(mimeType: string) {
  const normalized = mimeType.toLowerCase()

  if (normalized.includes('mp4')) {
    return 'm4a'
  }

  if (normalized.includes('ogg')) {
    return 'ogg'
  }

  return 'webm'
}

function stopAnalysisPolling() {
  if (!analysisPollTimer) return

  window.clearTimeout(analysisPollTimer)
  analysisPollTimer = 0
}

function scheduleAnalysisPolling() {
  stopAnalysisPolling()

  if (
    typeof window === 'undefined'
    || state.value !== 'analyzing'
  ) {
    return
  }

  analysisPollTimer = window.setTimeout(() => {
    void pollAnalysis()
  }, 1200)
}

function applyServerSessionState(session: TasmeeSession) {
  analysisErrorCode.value = session.analysis_error_code ?? ''
  analysisErrorMessage.value = session.analysis_error_message ?? ''

  if (session.status === 'report_ready') {
    stopAnalysisPolling()
    state.value = 'report-ready'
    return
  }

  if (session.status === 'analysis_pending') {
    stopAnalysisPolling()
    state.value = 'analysis-pending'
    return
  }

  if (
    session.status === 'failed'
    && session.analysis_started_at
  ) {
    stopAnalysisPolling()
    state.value = 'analysis-failed'
    return
  }

  if (session.status === 'analyzing') {
    state.value = 'analyzing'
    scheduleAnalysisPolling()
    return
  }

  if (session.status === 'uploaded') {
    stopAnalysisPolling()
    state.value = 'uploaded'
  }
}

async function pollAnalysis() {
  const sessionName = recording.value?.serverSessionName

  if (
    !sessionName
    || state.value !== 'analyzing'
  ) {
    return
  }

  try {
    const response = await getTasmeeSession(sessionName)
    applyServerSessionState(response.session)
  } catch {
    scheduleAnalysisPolling()
  }
}

async function loadRecording() {
  state.value = 'loading'
  uploadError.value = ''

  try {
    const stored = await getTasmeeRecording(recordingId.value)

    if (!stored) {
      recording.value = null
      state.value = 'missing'
      return
    }

    recording.value = stored

    if (
      stored.uploadedAt
      && stored.serverSessionName
    ) {
      try {
        const response = await getTasmeeSession(
          stored.serverSessionName,
        )

        applyServerSessionState(response.session)
        return
      } catch {
        state.value = 'uploaded'
        return
      }
    }

    state.value = stored.uploadedAt
      ? 'uploaded'
      : 'ended'
  } catch {
    recording.value = null
    state.value = 'missing'
  }
}

async function reconcileRecordingAssignment(
  current: StoredTasmeeRecording,
) {
  if (current.serverSessionName) {
    return current
  }

  const response = await dailyPlanCall.submit()
  const currentAssignment = response?.assignment

  if (!currentAssignment) {
    throw new Error('لا توجد مهمة حفظ يومية حالية لربط هذا التسجيل بها.')
  }

  if (current.assignmentName === currentAssignment.name) {
    return current
  }

  const sameRange = (
    current.surahNumber === currentAssignment.surah_number
    && current.startAyah === currentAssignment.start_ayah
    && current.endAyah === currentAssignment.end_ayah
  )

  if (!sameRange) {
    throw new Error(
      'هذا التسجيل مرتبط بمهمة حفظ قديمة تختلف عن مهمة اليوم الحالية.',
    )
  }

  const updated = await updateTasmeeRecording(current.id, {
    assignmentName: currentAssignment.name,
  })

  recording.value = updated

  await router.replace({
    name: 'tasmee-solo-session',
    params: {
      recordingId: current.id,
    },
    query: {
      assignment: currentAssignment.name,
    },
  })

  return updated
}

async function ensureServerSession(current: StoredTasmeeRecording) {
  if (current.serverSessionName) {
    return current.serverSessionName
  }

  const response = await createSessionCall.submit({
    assignment_name: current.assignmentName,
    client_session_id: current.id,
    session_mode: 'solo',
  })

  if (!response?.session) {
    throw new Error('تعذر إنشاء جلسة التسميع على الخادم.')
  }

  await updateTasmeeRecording(current.id, {
    serverSessionName: response.session.name,
  })

  return response.session.name
}

async function uploadRecording() {
  const current = recording.value

  if (
    !current
    || state.value === 'uploading'
  ) {
    return
  }

  state.value = 'uploading'
  uploadError.value = ''

  try {
    const activeRecording = await reconcileRecordingAssignment(current)
    const sessionName = await ensureServerSession(activeRecording)
    const extension = recordingFileExtension(activeRecording.mimeType)

    const response = await uploadTasmeeRecording({
      sessionName,
      blob: activeRecording.blob,
      fileName: `tasmee-${activeRecording.id.replace(/[^a-zA-Z0-9_-]/g, '-')}.${extension}`,
      durationSeconds: activeRecording.durationSeconds,
    })

    const updated = await updateTasmeeRecording(activeRecording.id, {
      serverSessionName: response.session.name,
      uploadedAt: new Date().toISOString(),
    })

    recording.value = updated
    state.value = 'uploaded'
  } catch (cause) {
    uploadError.value = cause instanceof Error
      ? cause.message
      : 'تعذر رفع التسجيل. أعد المحاولة عند استقرار الاتصال.'
    state.value = 'upload-failed'
  }
}

async function startAnalysis() {
  const sessionName = recording.value?.serverSessionName

  if (
    !sessionName
    || state.value === 'analyzing'
  ) {
    return
  }

  stopAnalysisPolling()
  state.value = 'analyzing'
  analysisErrorCode.value = ''
  analysisErrorMessage.value = ''

  try {
    const response = await startAnalysisCall.submit({
      session_name: sessionName,
    })

    if (!response?.session) {
      throw new Error('تعذر بدء تحليل جلسة التسميع.')
    }

    applyServerSessionState(response.session)
  } catch (cause) {
    stopAnalysisPolling()
    analysisErrorMessage.value = cause instanceof Error
      ? cause.message
      : 'تعذر بدء تحليل جلسة التسميع.'
    state.value = 'analysis-failed'
  }
}

function returnLater() {
  void router.push('/quran/hifz/daily-plan')
}

onMounted(() => {
  void loadRecording()
})

onBeforeUnmount(() => {
  stopAnalysisPolling()
})
</script>

<template>
  <main
    dir="rtl"
    class="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col gap-[var(--sqc-dimension-spacing-16)] bg-[var(--sqc-color-background-primary)] px-[var(--sqc-dimension-spacing-16)] py-[var(--sqc-dimension-spacing-24)] [font-family:var(--sqc-font-family-ui)]"
  >
    <BaseAppBar
      title="التسميع"
      class="shrink-0"
    />

    <div
      v-if="state === 'loading'"
      class="grid flex-1 place-items-center"
    >
      <BaseLoading label="جاري تحميل التسجيل المحفوظ" />
    </div>

    <section
      v-else-if="state === 'missing'"
      class="flex flex-1 flex-col justify-center gap-[var(--sqc-dimension-spacing-16)]"
    >
      <BaseBanner
        tone="error"
        title="تعذر العثور على التسجيل"
        body="التسجيل المحلي لهذه الجلسة غير متوفر على هذا الجهاز."
      />

      <BaseButton
        size="large"
        variant="secondary"
        class="w-full"
        @click="returnLater"
      >
        العودة لخطة اليوم
      </BaseButton>
    </section>

    <template v-else-if="recording">
      <template v-if="state === 'ended'">
        <TasmeeStateHeader
          state="session-ended"
          title="انتهت جلسة التسميع"
          :subtitle="sessionMeta"
        />

        <TasmeeSessionTimer
          :seconds="recording.durationSeconds"
          :active="false"
        />

        <TasmeeVerificationBadge label="محفوظ محليًا" />

        <BaseBanner
          tone="info"
          title="التسجيل محفوظ على جهازك"
          body="لم يُرفع التسجيل بعد. ارفعه بأمان لبدء المرحلة التالية دون فقد النسخة المحلية."
        />

        <div class="min-h-[16px] flex-1" />

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
          @click="returnLater"
        >
          العودة لاحقًا
        </BaseButton>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          @click="uploadRecording"
        >
          رفع التسجيل
        </BaseButton>
      </template>

      <template v-else-if="state === 'uploading'">
        <TasmeeStateHeader
          state="uploading"
          title="جارٍ رفع التسجيل"
          subtitle="نحفظ تسجيل التسميع بأمان على الخادم."
        />

        <BaseLoading label="جاري رفع التسجيل" />

        <BaseBanner
          tone="info"
          title="النسخة المحلية محفوظة"
          body="سيبقى التسجيل على جهازك حتى يكتمل الرفع بنجاح، لذلك لن تفقد الجلسة إذا انقطع الاتصال."
        />

        <div class="min-h-[16px] flex-1" />
      </template>

      <template v-else-if="state === 'upload-failed'">
        <TasmeeStateHeader
          state="failed"
          title="تعذّر رفع التسجيل"
          subtitle="حدث خطأ تقني أثناء إرسال التسجيل."
        />

        <BaseBanner
          tone="error"
          title="تسجيلك لم يُفقد"
          :body="uploadError || 'النسخة المحلية ما تزال محفوظة على جهازك. أعد المحاولة عند استقرار الاتصال.'"
        />

        <div class="min-h-[16px] flex-1" />

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
          @click="returnLater"
        >
          العودة لاحقًا
        </BaseButton>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          @click="uploadRecording"
        >
          إعادة محاولة الرفع
        </BaseButton>
      </template>

      <template v-else-if="state === 'uploaded'">
        <TasmeeStateHeader
          state="uploaded"
          title="تم رفع التسجيل"
          subtitle="التسجيل محفوظ على الخادم وجاهز للمرحلة التالية."
        />

        <TasmeeVerificationBadge label="التسجيل مرفوع" />

        <BaseBanner
          tone="info"
          title="الخطوة التالية: التحليل"
          body="نجاح الرفع لا يعني اعتماد الحفظ أو تغيير تقدّمك. سنربط محرك التحليل في الخطوة التالية."
        />

        <div class="min-h-[16px] flex-1" />

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
          @click="returnLater"
        >
          العودة لخطة اليوم
        </BaseButton>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          @click="startAnalysis"
        >
          بدء التحليل
        </BaseButton>
      </template>

      <template v-else-if="state === 'analyzing'">
        <TasmeeStateHeader
          state="analyzing"
          title="نحلّل التسميع الآن"
          subtitle="تتم المعالجة بعد انتهاء القراءة حتى لا تتشتت أثناء التسميع."
        />

        <BaseLoading label="قيد التحليل" />

        <BaseBanner
          tone="info"
          title="تحليل متعدد المراحل"
          body="التعرّف على الكلام ← محاذاة كلمات القرآن ← تصنيف الملاحظات ← تقدير الثقة. لا نعرض نسبة تقدّم وهمية."
        />

        <div class="min-h-[16px] flex-1" />
      </template>

      <template v-else-if="state === 'analysis-pending'">
        <TasmeeStateHeader
          state="analysis-pending"
          title="اكتملت المحاذاة"
          subtitle="تم تحويل التسجيل إلى نص وربط الكلمات مع المرجع القرآني بنجاح."
        />

        <TasmeeVerificationBadge label="المحاذاة مكتملة" />

        <BaseBanner
          tone="info"
          title="الخطوة التالية: تصنيف الملاحظات"
          body="المحاذاة اكتملت بنجاح. لم نصدر حكمًا على الحفظ بعد؛ المرحلة التالية ستصنّف الاختلافات وتقدّر الثقة قبل إنشاء التقرير."
        />

        <div class="min-h-[16px] flex-1" />

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
          @click="returnLater"
        >
          العودة لخطة اليوم
        </BaseButton>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          @click="startAnalysis"
        >
          متابعة التحليل
        </BaseButton>
      </template>

      <template v-else-if="state === 'analysis-failed'">
        <TasmeeStateHeader
          state="failed"
          title="تعذّر إكمال التحليل"
          subtitle="فشل التحليل تقنيًا، وليس هذا حكمًا على الحفظ."
        />

        <BaseBanner
          tone="error"
          title="لا حاجة لإعادة رفع التسجيل"
          :body="analysisErrorText"
        />

        <div class="min-h-[16px] flex-1" />

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
          @click="returnLater"
        >
          العودة لخطة اليوم
        </BaseButton>

        <BaseButton
          size="large"
          variant="primary"
          class="w-full"
          @click="startAnalysis"
        >
          إعادة التحليل
        </BaseButton>
      </template>

      <template v-else-if="state === 'report-ready'">
        <TasmeeStateHeader
          state="report-ready"
          title="التقرير جاهز"
          subtitle="اكتمل تحليل جلسة التسميع."
        />

        <BaseBanner
          tone="info"
          title="نتائج التحليل جاهزة"
          body="سيتم عرض نتائج الآيات والملاحظات ومستوى التحقق في شاشة التقرير."
        />

        <div class="min-h-[16px] flex-1" />

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
          @click="returnLater"
        >
          العودة لخطة اليوم
        </BaseButton>
      </template>
    </template>
  </main>
</template>
