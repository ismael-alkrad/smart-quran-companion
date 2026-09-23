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
  getTasmeeAnalysisStatus,
  getTasmeeSession,
  uploadTasmeeRecording,
  useApplyTasmeeVerificationMutation,
  useCreateTasmeeSessionMutation,
  useEvaluateTasmeeVerificationMutation,
  useStartTasmeeAnalysisMutation,
  type TasmeeSession,
} from '@/modules/tasmee/api'
import TasmeeIssueRow from '@/modules/tasmee/components/TasmeeIssueRow.vue'
import TasmeeSessionTimer from '@/modules/tasmee/components/TasmeeSessionTimer.vue'
import TasmeeStateHeader from '@/modules/tasmee/components/TasmeeStateHeader.vue'
import TasmeeVerificationBadge, {
  type TasmeeVerificationBadgeState,
} from '@/modules/tasmee/components/TasmeeVerificationBadge.vue'
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
const applyVerificationCall = useApplyTasmeeVerificationMutation()
const createSessionCall = useCreateTasmeeSessionMutation()
const evaluateVerificationCall = useEvaluateTasmeeVerificationMutation()
const startAnalysisCall = useStartTasmeeAnalysisMutation()
const dailyPlanCall = useEnsureHifzDailyAssignmentMutation()

const state = ref<PostRecordingState>('loading')
const recording = ref<StoredTasmeeRecording | null>(null)
const serverSession = ref<TasmeeSession | null>(null)
const uploadError = ref('')
const analysisErrorCode = ref('')
const analysisErrorMessage = ref('')
const verificationEvaluationPending = ref(false)
const verificationApplyPending = ref(false)
const verificationApplyError = ref('')

const ANALYSIS_POLL_INTERVAL_MS = 5000
const ANALYSIS_POLL_RETRY_MS = 15000

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

  if (analysisErrorCode.value === 'classification_failed') {
    return 'اكتملت المحاذاة، لكن تعذر تصنيف الملاحظات تقنيًا. التسجيل والمحاذاة محفوظان ويمكن إعادة المحاولة.'
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

const reportSessionMeta = computed(() => {
  const session = serverSession.value

  if (!session) return ''

  const surahName = getSurahNameArabic(session.surah_number)
  const ayahRange = session.start_ayah === session.end_ayah
    ? `الآية ${toArabicNumber(session.start_ayah)}`
    : `الآيات ${toArabicNumber(session.start_ayah)}–${toArabicNumber(session.end_ayah)}`

  return `سورة ${surahName} · ${ayahRange}`
})

const verificationBadgeState = computed<TasmeeVerificationBadgeState>(() => {
  const level = serverSession.value?.verification_level

  if (level === 'human_verified') return 'human-verified'
  if (level === 'ai_high_confidence') return 'ai-high-confidence'
  if (level === 'ai_analyzed') return 'ai-analyzed'
  return 'self'
})

const verificationBadgeLabel = computed(() => {
  const level = serverSession.value?.verification_level

  if (level === 'human_verified') return 'تم التحقق بشريًا'
  if (level === 'ai_high_confidence') return 'تحليل آلي عالي الثقة'
  if (level === 'ai_analyzed') return 'تم التحليل بالذكاء الاصطناعي'
  return 'تحقق ذاتي'
})

const verificationPolicyBody = computed(() => {
  const session = serverSession.value

  if (!session || session.verification_decision === 'pending') {
    return 'يتم تقييم نتيجة التحليل وفق سياسة التحقق قبل السماح بأي تغيير على حالة الحفظ.'
  }

  if (
    !session.ai_hifz_updates_enabled
    && (
      session.verification_decision === 'approve'
      || session.verification_decision === 'needs_review'
    )
  ) {
    return 'نتيجة الذكاء الاصطناعي معروضة للمراجعة فقط حاليًا، ولن تغيّر حالة الحفظ حتى نعتمد دقة مسار التعرف الصوتي صراحة.'
  }

  if (session.verification_decision === 'approve') {
    return 'النتيجة مؤهلة للاعتماد بثقة عالية، لكن التقرير وحده لم يغيّر حالة الحفظ بعد.'
  }

  if (session.verification_decision === 'needs_review') {
    return 'رصدت السياسة ملاحظات حفظ عالية الثقة. لم نغيّر حالة الحفظ بعد؛ التطبيق يتم في خطوة منفصلة.'
  }

  if (session.verification_reason_code === 'audio_uncertainty') {
    return 'يوجد عدم يقين صوتي، لذلك لن تغيّر نتيجة الذكاء الاصطناعي حالة الحفظ.'
  }

  if (session.verification_reason_code === 'audio_unusable') {
    return 'جودة التسجيل غير كافية للتحقق، لذلك لا يوجد أي تغيير على حالة الحفظ.'
  }

  if (session.verification_reason_code === 'memorization_issue_not_reliable_enough') {
    return 'ظهرت ملاحظات محتملة، لكن الدليل غير كافٍ لاعتمادها كتغيير على حالة الحفظ.'
  }

  if (session.verification_reason_code === 'incomplete_ayah_results') {
    return 'نتائج الآيات غير مكتملة، لذلك لا يسمح النظام بأي تغيير على حالة الحفظ.'
  }

  return 'التقرير صالح للعرض، لكنه لم يحقق شروط السياسة اللازمة لتغيير حالة الحفظ.'
})

const canStartNewTasmee = computed(() => {
  const session = serverSession.value

  return Boolean(
    session
    && session.status === 'report_ready'
    && (
      session.verification_decision === 'no_change'
      || session.verification_decision === 'needs_review'
    ),
  )
})

const canApplyVerification = computed(() => {
  const session = serverSession.value

  return Boolean(
    session
    && session.ai_hifz_updates_enabled
    && !session.verification_applied
    && (
      session.verification_decision === 'approve'
      || session.verification_decision === 'needs_review'
    ),
  )
})

const verificationApplyLabel = computed(() => (
  serverSession.value?.verification_decision === 'approve'
    ? 'اعتماد نتيجة التسميع'
    : 'إرسال الآيات للمراجعة'
))

const verificationAppliedBody = computed(() => {
  const session = serverSession.value

  if (!session?.verification_applied) return ''

  if (session.verification_applied_decision === 'approve') {
    return 'تم اعتماد آيات المهمة وتحديث مهمة الحفظ إلى مكتملة.'
  }

  if (session.verification_applied_decision === 'needs_review') {
    return 'تم تحديث الآيات المتأثرة إلى تحتاج مراجعة، وبقيت مهمة الحفظ نشطة.'
  }

  return 'تم تثبيت قرار عدم التغيير، ولم تتغير حالة الحفظ.'
})

function issuesForAyah(ayahNumber: number) {
  return serverSession.value?.issues.filter(
    issue => (
      issue.ayah_number === ayahNumber
      && issue.category !== 'audio'
    ),
  ) ?? []
}

function ayahOutcomeLabel(outcome: TasmeeSession['ayah_results'][number]['outcome']) {
  if (outcome === 'correct') return 'صحيحة'
  if (outcome === 'incorrect') return 'تحتاج مراجعة'
  if (outcome === 'audio_uncertain') return 'الصوت غير واضح'
  if (outcome === 'needs_attention') return 'تحتاج انتباه'
  return 'غير مقيمة'
}

function ayahOutcomeMeta(result: TasmeeSession['ayah_results'][number]) {
  if (result.outcome === 'correct') {
    return 'لم تُرصد مشكلة حفظ في هذه الآية'
  }

  if (result.outcome === 'incorrect') {
    const memorizationCount = toArabicNumber(
      result.memorization_issue_count,
    )

    return result.audio_issue_count > 0
      ? `رُصدت ${memorizationCount} ملاحظات حفظ مرجّحة، مع ${toArabicNumber(result.audio_issue_count)} مواضع صوتية غير مؤكدة`
      : `رُصدت ${memorizationCount} ملاحظات حفظ مرجّحة وتبقى خاضعة لسياسة التحقق`
  }

  if (result.outcome === 'audio_uncertain') {
    const audioCount = toArabicNumber(result.audio_issue_count)

    return `عدم يقين صوتي في ${audioCount} مواضع · لا يُحتسب كخطأ حفظ`
  }

  if (result.outcome === 'needs_attention') {
    return 'تحتاج مراجعة دون اعتمادها كخطأ حفظ تلقائيًا'
  }

  return 'لم يكتمل تقييم هذه الآية'
}

function ayahOutcomeClasses(outcome: TasmeeSession['ayah_results'][number]['outcome']) {
  if (outcome === 'correct') {
    return [
      'bg-[var(--sqc-color-toast-success-background,#f0f8f6)]',
      'text-[color:var(--sqc-color-status-success,#237a63)]',
    ]
  }

  if (outcome === 'incorrect') {
    return [
      'bg-[var(--sqc-color-potentialissue-substitution-background,#fef2f2)]',
      'text-[color:var(--sqc-color-potentialissue-substitution-foreground,#b91c1c)]',
    ]
  }

  if (outcome === 'audio_uncertain') {
    return [
      'bg-[var(--sqc-color-potentialissue-audiounclear-background,#eff6ff)]',
      'text-[color:var(--sqc-color-potentialissue-audiounclear-foreground,#1d4ed8)]',
    ]
  }

  return [
    'bg-[var(--sqc-color-potentialissue-hesitation-background,#fffbeb)]',
    'text-[color:var(--sqc-color-potentialissue-hesitation-foreground,#92400e)]',
  ]
}

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

function scheduleAnalysisPolling(
  delayMs = ANALYSIS_POLL_INTERVAL_MS,
) {
  stopAnalysisPolling()

  if (
    typeof window === 'undefined'
    || state.value !== 'analyzing'
  ) {
    return
  }

  analysisPollTimer = window.setTimeout(() => {
    void pollAnalysis()
  }, delayMs)
}

async function applyVerificationDecision(
  session: TasmeeSession,
  silent = false,
) {
  if (
    session.verification_applied
    || verificationApplyPending.value
  ) {
    return
  }

  verificationApplyPending.value = true

  if (!silent) {
    verificationApplyError.value = ''
  }

  try {
    const response = await applyVerificationCall.submit({
      session_name: session.name,
    })

    if (response?.session) {
      serverSession.value = response.session
    }
  } catch (cause) {
    if (!silent) {
      verificationApplyError.value = cause instanceof Error
        ? cause.message
        : 'تعذر تطبيق قرار التحقق على حالة الحفظ.'
    }
  } finally {
    verificationApplyPending.value = false
  }
}

async function syncVerificationState(session: TasmeeSession) {
  if (
    session.status !== 'report_ready'
    || verificationEvaluationPending.value
  ) {
    return
  }

  let current = session

  if (current.verification_decision === 'pending') {
    verificationEvaluationPending.value = true

    try {
      const response = await evaluateVerificationCall.submit({
        session_name: current.name,
      })

      if (response?.session) {
        current = response.session
        serverSession.value = current
      }
    } catch {
      return
    } finally {
      verificationEvaluationPending.value = false
    }
  }

  if (
    current.verification_decision === 'no_change'
    && !current.verification_applied
  ) {
    await applyVerificationDecision(current, true)
  }
}

function applyServerSessionState(session: TasmeeSession) {
  serverSession.value = session
  analysisErrorCode.value = session.analysis_error_code ?? ''
  analysisErrorMessage.value = session.analysis_error_message ?? ''

  if (session.status === 'report_ready') {
    stopAnalysisPolling()
    state.value = 'report-ready'
    void syncVerificationState(session)
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
    const status = await getTasmeeAnalysisStatus(sessionName)

    analysisErrorCode.value = status.analysis_error_code ?? ''
    analysisErrorMessage.value = status.analysis_error_message ?? ''

    if (status.status === 'analyzing') {
      scheduleAnalysisPolling()
      return
    }

    const response = await getTasmeeSession(sessionName)
    applyServerSessionState(response.session)
  } catch {
    scheduleAnalysisPolling(ANALYSIS_POLL_RETRY_MS)
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
        try {
          const status = await getTasmeeAnalysisStatus(
            stored.serverSessionName,
          )

          analysisErrorCode.value = status.analysis_error_code ?? ''
          analysisErrorMessage.value = status.analysis_error_message ?? ''

          if (
            status.status === 'analyzing'
            || status.status === 'report_ready'
            || status.status === 'analysis_pending'
            || status.status === 'failed'
          ) {
            state.value = 'analyzing'
            scheduleAnalysisPolling(ANALYSIS_POLL_RETRY_MS)
            return
          }
        } catch {
          // Fall back to the uploaded state only when neither status
          // endpoint is currently reachable.
        }

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
    try {
      const status = await getTasmeeAnalysisStatus(sessionName)

      analysisErrorCode.value = status.analysis_error_code ?? ''
      analysisErrorMessage.value = status.analysis_error_message ?? ''

      if (status.status === 'analyzing') {
        state.value = 'analyzing'
        scheduleAnalysisPolling()
        return
      }

      if (
        status.status === 'report_ready'
        || status.status === 'analysis_pending'
        || status.status === 'failed'
      ) {
        const response = await getTasmeeSession(sessionName)
        applyServerSessionState(response.session)
        return
      }
    } catch {
      // Fall through to the original start-analysis error only when
      // the lightweight status endpoint cannot recover the session.
    }

    stopAnalysisPolling()
    analysisErrorMessage.value = cause instanceof Error
      ? cause.message
      : 'تعذر بدء تحليل جلسة التسميع.'
    state.value = 'analysis-failed'
  }
}

function startNewTasmee() {
  const session = serverSession.value
  if (!session) return

  void router.push({
    name: 'tasmee-solo-setup',
    query: {
      assignment: session.assignment,
      fresh: String(Date.now()),
    },
  })
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
      :title="state === 'report-ready' ? 'تقرير التسميع' : 'التسميع'"
      :type="state === 'report-ready' ? 'back' : 'default'"
      class="shrink-0"
      @back="returnLater"
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

      <template v-else-if="state === 'report-ready' && serverSession">
        <TasmeeStateHeader
          state="report-ready"
          title="التقرير جاهز"
          :subtitle="reportSessionMeta"
        />

        <TasmeeVerificationBadge
          :state="verificationBadgeState"
          :label="verificationBadgeLabel"
        />

        <BaseBanner
          tone="info"
          title="سياسة التحقق"
          :body="verificationPolicyBody"
        />

        <BaseBanner
          v-if="serverSession.verification_applied && serverSession.verification_hifz_changed"
          :tone="serverSession.verification_applied_decision === 'needs_review' ? 'warning' : 'info'"
          title="تم تطبيق قرار التحقق"
          :body="verificationAppliedBody"
        />

        <BaseBanner
          v-if="verificationApplyError"
          tone="error"
          title="تعذر تطبيق قرار التحقق"
          :body="verificationApplyError"
        />

        <section class="flex w-full flex-col gap-[10px]">
          <h2 class="w-full text-right text-[16px] font-semibold leading-[24px] text-[color:var(--sqc-color-text-primary)]">
            نتائج الآيات
          </h2>

          <div
            v-for="result in serverSession.ayah_results"
            :key="result.ayah_number"
            class="flex w-full flex-col gap-[8px]"
          >
            <article
              class="w-full rounded-[var(--sqc-dimension-radius-12)] px-[12px] py-[10px] text-right"
              :class="ayahOutcomeClasses(result.outcome)"
            >
              <h3 class="text-[14px] font-semibold leading-[22px]">
                الآية {{ toArabicNumber(result.ayah_number) }} · {{ ayahOutcomeLabel(result.outcome) }}
              </h3>
              <p class="mt-[4px] text-[12px] font-normal leading-[20px]">
                {{ ayahOutcomeMeta(result) }}
              </p>
              <p
                v-if="result.transcript_text"
                class="mt-[4px] break-words text-[12px] font-normal leading-[20px] opacity-80"
              >
                المسموع: {{ result.transcript_text }}
              </p>
            </article>

            <TasmeeIssueRow
              v-for="(issue, issueIndex) in issuesForAyah(result.ayah_number)"
              :key="`${result.ayah_number}-${issue.word_location ?? issueIndex}-${issue.issue_type}`"
              :issue="issue"
            />
          </div>
        </section>

        <div class="min-h-[8px] flex-1" />

        <BaseButton
          v-if="canApplyVerification"
          size="large"
          variant="primary"
          class="w-full"
          :loading="verificationApplyPending"
          loading-text="جارٍ تطبيق القرار"
          @click="serverSession && applyVerificationDecision(serverSession)"
        >
          {{ verificationApplyLabel }}
        </BaseButton>

        <BaseButton
          v-if="canStartNewTasmee"
          size="large"
          :variant="canApplyVerification ? 'secondary' : 'primary'"
          class="w-full"
          @click="startNewTasmee"
        >
          بدء تسميع جديد
        </BaseButton>

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
