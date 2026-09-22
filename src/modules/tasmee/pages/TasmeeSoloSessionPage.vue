<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  uploadTasmeeRecording,
  useCreateTasmeeSessionMutation,
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
  | 'missing'

const route = useRoute()
const router = useRouter()
const createSessionCall = useCreateTasmeeSessionMutation()

const state = ref<PostRecordingState>('loading')
const recording = ref<StoredTasmeeRecording | null>(null)
const serverSession = ref<TasmeeSession | null>(null)
const uploadError = ref('')

const recordingId = computed(() => {
  const value = route.params.recordingId

  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return typeof value === 'string'
    ? value
    : ''
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
    state.value = stored.uploadedAt
      ? 'uploaded'
      : 'ended'
  } catch {
    recording.value = null
    state.value = 'missing'
  }
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

  serverSession.value = response.session

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
    const sessionName = await ensureServerSession(current)
    const extension = recordingFileExtension(current.mimeType)

    const response = await uploadTasmeeRecording({
      sessionName,
      blob: current.blob,
      fileName: `tasmee-${current.id.replace(/[^a-zA-Z0-9_-]/g, '-') }.${extension}`,
      durationSeconds: current.durationSeconds,
    })

    serverSession.value = response.session

    const updated = await updateTasmeeRecording(current.id, {
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

function returnLater() {
  void router.push('/quran/hifz/daily-plan')
}

onMounted(() => {
  void loadRecording()
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
          disabled
        >
          بدء التحليل
        </BaseButton>
      </template>
    </template>
  </main>
</template>
