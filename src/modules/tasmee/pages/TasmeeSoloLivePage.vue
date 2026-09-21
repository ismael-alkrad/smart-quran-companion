<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import TasmeeSessionTimer from '@/modules/tasmee/components/TasmeeSessionTimer.vue'
import TasmeeStateHeader from '@/modules/tasmee/components/TasmeeStateHeader.vue'
import TasmeeVerificationBadge from '@/modules/tasmee/components/TasmeeVerificationBadge.vue'
import TasmeeWaveform from '@/modules/tasmee/components/TasmeeWaveform.vue'
import { useTasmeeDailyAssignment } from '@/modules/tasmee/composables/useTasmeeDailyAssignment'
import {
  saveTasmeeRecording,
} from '@/modules/tasmee/repositories/tasmeeRecording.repository'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
  BaseLoading,
} from '@/shared/components'

type LiveSessionState =
  | 'starting'
  | 'listening'
  | 'paused'
  | 'ended'
  | 'error'

const router = useRouter()

const {
  assignment,
  loading,
  failed,
  error,
  refresh,
} = useTasmeeDailyAssignment()

const sessionState = ref<LiveSessionState>('starting')
const sessionError = ref('')
const elapsedSeconds = ref(0)
const waveformLevels = ref<number[]>(
  Array.from({ length: 9 }, () => 0.1),
)
const finishing = ref(false)

let mediaStream: MediaStream | null = null
let mediaRecorder: MediaRecorder | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let animationFrame = 0
let timerId = 0
let sessionStarted = false
let recorderMimeType = ''
const audioChunks: Blob[] = []

const isListening = computed(() =>
  sessionState.value === 'listening',
)

const isPaused = computed(() =>
  sessionState.value === 'paused',
)

const liveHeader = computed(() => {
  if (isPaused.value) {
    return {
      state: 'paused' as const,
      title: 'متوقف مؤقتًا',
      subtitle: 'الجلسة محفوظة مؤقتًا ويمكنك الاستئناف من النقطة نفسها.',
    }
  }

  return {
    state: 'listening' as const,
    title: 'أستمع الآن',
    subtitle: 'اقرأ بهدوء؛ لن تظهر لك ملاحظات الأخطاء أثناء القراءة.',
  }
})

function chooseRecorderMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ]

  return candidates.find(type =>
    MediaRecorder.isTypeSupported(type),
  ) ?? ''
}

function clearTimer() {
  if (!timerId) return

  window.clearInterval(timerId)
  timerId = 0
}

function startTimer() {
  clearTimer()

  timerId = window.setInterval(() => {
    if (sessionState.value === 'listening') {
      elapsedSeconds.value += 1
    }
  }, 1000)
}

function stopWaveform() {
  if (!animationFrame) return

  cancelAnimationFrame(animationFrame)
  animationFrame = 0
}

function sampleWaveform() {
  stopWaveform()

  const activeAnalyser = analyser

  if (
    !activeAnalyser
    || sessionState.value !== 'listening'
  ) {
    return
  }

  const samples = new Float32Array(activeAnalyser.fftSize)

  const sample = () => {
    if (
      !analyser
      || sessionState.value !== 'listening'
    ) {
      animationFrame = 0
      return
    }

    analyser.getFloatTimeDomainData(samples)

    const chunkSize = Math.floor(samples.length / 9)

    waveformLevels.value = Array.from(
      { length: 9 },
      (_, index) => {
        const start = index * chunkSize
        const end = index === 8
          ? samples.length
          : start + chunkSize

        let total = 0

        for (
          let sampleIndex = start;
          sampleIndex < end;
          sampleIndex += 1
        ) {
          total += Math.abs(samples[sampleIndex] ?? 0)
        }

        const average = total / Math.max(1, end - start)

        return Math.min(
          1,
          Math.max(0.08, average * 8),
        )
      },
    )

    animationFrame = requestAnimationFrame(sample)
  }

  sample()
}

async function releaseAudioResources() {
  stopWaveform()
  clearTimer()

  mediaStream?.getTracks().forEach(track => track.stop())
  mediaStream = null
  analyser = null

  if (
    audioContext
    && audioContext.state !== 'closed'
  ) {
    try {
      await audioContext.close()
    } catch {
      // The audio context may already be closed by the browser.
    }
  }

  audioContext = null
}

function buildRecordingBlob() {
  return new Blob(
    audioChunks,
    recorderMimeType
      ? { type: recorderMimeType }
      : undefined,
  )
}

async function stopRecorder() {
  const recorder = mediaRecorder

  if (!recorder || recorder.state === 'inactive') {
    return buildRecordingBlob()
  }

  return await new Promise<Blob>((resolve, reject) => {
    const handleStop = () => {
      resolve(buildRecordingBlob())
    }

    recorder.addEventListener(
      'stop',
      handleStop,
      { once: true },
    )

    try {
      recorder.stop()
    } catch (cause) {
      reject(cause)
    }
  })
}

async function startLiveSession() {
  if (
    sessionStarted
    || !assignment.value
  ) {
    return
  }

  sessionStarted = true
  sessionState.value = 'starting'
  sessionError.value = ''

  if (
    typeof navigator === 'undefined'
    || !navigator.mediaDevices?.getUserMedia
    || typeof MediaRecorder === 'undefined'
    || typeof AudioContext === 'undefined'
  ) {
    sessionState.value = 'error'
    sessionError.value = 'التسجيل الصوتي غير مدعوم على هذا الجهاز أو المتصفح.'
    return
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    })

    audioContext = new AudioContext()

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const source = audioContext.createMediaStreamSource(
      mediaStream,
    )

    analyser = audioContext.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.55
    source.connect(analyser)

    recorderMimeType = chooseRecorderMimeType()

    mediaRecorder = recorderMimeType
      ? new MediaRecorder(
          mediaStream,
          { mimeType: recorderMimeType },
        )
      : new MediaRecorder(mediaStream)

    recorderMimeType = mediaRecorder.mimeType
      || recorderMimeType

    mediaRecorder.addEventListener(
      'dataavailable',
      (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      },
    )

    mediaRecorder.start(1000)
    sessionState.value = 'listening'
    startTimer()
    sampleWaveform()
  } catch (cause) {
    sessionState.value = 'error'

    if (
      cause instanceof DOMException
      && (
        cause.name === 'NotAllowedError'
        || cause.name === 'SecurityError'
      )
    ) {
      sessionError.value = 'لا يمكن بدء التسميع بدون إذن الميكروفون.'
    } else {
      sessionError.value = 'تعذر بدء التسجيل الصوتي. أعد فحص الميكروفون وحاول مرة أخرى.'
    }

    await releaseAudioResources()
  }
}

function pauseSession() {
  if (
    !mediaRecorder
    || mediaRecorder.state !== 'recording'
  ) {
    return
  }

  mediaRecorder.pause()
  sessionState.value = 'paused'
  stopWaveform()
}

function resumeSession() {
  if (
    !mediaRecorder
    || mediaRecorder.state !== 'paused'
  ) {
    return
  }

  mediaRecorder.resume()
  sessionState.value = 'listening'
  sampleWaveform()
}

async function endSession() {
  const currentAssignment = assignment.value

  if (
    !currentAssignment
    || finishing.value
    || (
      sessionState.value !== 'listening'
      && sessionState.value !== 'paused'
    )
  ) {
    return
  }

  finishing.value = true
  sessionError.value = ''

  try {
    const recordingBlob = await stopRecorder()
    await releaseAudioResources()

    if (!recordingBlob.size) {
      throw new Error('The recorded audio is empty.')
    }

    const recordingId = [
      currentAssignment.name,
      Date.now(),
    ].join(':')

    await saveTasmeeRecording({
      id: recordingId,
      assignmentName: currentAssignment.name,
      blob: recordingBlob,
      mimeType: recordingBlob.type || recorderMimeType,
      durationSeconds: elapsedSeconds.value,
      createdAt: new Date().toISOString(),
    })

    sessionState.value = 'ended'
  } catch {
    sessionState.value = 'error'
    sessionError.value = 'تعذر حفظ تسجيل الجلسة محليًا. لم يتم إرسال أي تقييم.'
    await releaseAudioResources()
  } finally {
    finishing.value = false
  }
}

function returnLater() {
  void router.push('/quran/hifz/daily-plan')
}

function returnToReady() {
  const current = assignment.value

  void router.push({
    name: 'tasmee-solo-ready',
    query: current
      ? { assignment: current.name }
      : {},
  })
}

watch(
  () => [
    assignment.value?.name ?? null,
    loading.value,
  ] as const,
  ([assignmentName, isLoading]) => {
    if (
      !assignmentName
      || isLoading
      || sessionStarted
    ) {
      return
    }

    void startLiveSession()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (
    mediaRecorder
    && mediaRecorder.state !== 'inactive'
  ) {
    try {
      mediaRecorder.stop()
    } catch {
      // The recorder is already shutting down.
    }
  }

  void releaseAudioResources()
})
</script>

<template>
  <main
    dir="rtl"
    class="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col gap-[var(--sqc-dimension-spacing-16)] bg-[var(--sqc-color-background-primary)] px-[var(--sqc-dimension-spacing-16)] py-[var(--sqc-dimension-spacing-24)] [font-family:var(--sqc-font-family-ui)]"
  >
    <template v-if="sessionState === 'ended' && assignment">
      <BaseAppBar
        title="الجلسة"
        class="shrink-0"
      />

      <TasmeeStateHeader
        state="session-ended"
        title="انتهت الجلسة"
        subtitle="تم حفظ القراءة محليًا. يمكنك بدء التحليل لاحقًا بعد ربط خدمة التحليل."
      />

      <TasmeeSessionTimer
        :seconds="elapsedSeconds"
        :active="false"
      />

      <TasmeeVerificationBadge label="الجلسة محفوظة" />

      <BaseBanner
        tone="info"
        title="جاهزة للتحليل"
        body="التسجيل محفوظ على هذا الجهاز ولم يتم تقييم الحفظ أو تغيير حالته تلقائيًا."
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
        disabled
      >
        بدء التحليل
      </BaseButton>
    </template>

    <template v-else>
      <BaseAppBar
        title="تسميع مباشر"
        class="shrink-0"
      />

      <div
        v-if="loading || sessionState === 'starting'"
        class="grid flex-1 place-items-center"
      >
        <BaseLoading label="جاري بدء جلسة التسميع" />
      </div>

      <section
        v-else-if="
          failed
          || !assignment
          || sessionState === 'error'
        "
        class="flex flex-1 flex-col justify-center gap-[var(--sqc-dimension-spacing-16)]"
      >
        <BaseBanner
          tone="error"
          title="تعذر تشغيل جلسة التسميع"
          :body="
            sessionError
            || (
              error instanceof Error
                ? error.message
                : 'تعذر العثور على مهمة الحفظ المرتبطة بهذه الجلسة.'
            )
          "
        />

        <BaseButton
          v-if="failed || !assignment"
          size="large"
          variant="secondary"
          class="w-full"
          @click="refresh"
        >
          إعادة المحاولة
        </BaseButton>

        <BaseButton
          size="large"
          variant="secondary"
          class="w-full"
          @click="returnToReady"
        >
          العودة إلى شاشة الجاهزية
        </BaseButton>
      </section>

      <template v-else>
        <TasmeeStateHeader
          :state="liveHeader.state"
          :title="liveHeader.title"
          :subtitle="liveHeader.subtitle"
        />

        <TasmeeSessionTimer
          :seconds="elapsedSeconds"
          :active="isListening"
        />

        <TasmeeWaveform
          :state="isPaused ? 'paused' : 'listening'"
          :levels="waveformLevels"
        />

        <section
          class="flex h-[270px] w-full flex-col items-center gap-[var(--sqc-dimension-spacing-16)] rounded-[var(--sqc-dimension-radius-16)] bg-[var(--sqc-color-background-elevated)] p-[var(--sqc-dimension-spacing-20)]"
        >
          <div class="flex w-full items-center justify-between overflow-hidden">
            <h2
              class="text-right text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
            >
              {{ isPaused ? 'التسميع متوقف مؤقتًا' : 'أنت تقرأ الآن' }}
            </h2>

            <TasmeeSessionTimer
              :seconds="elapsedSeconds"
              :active="isListening"
            />
          </div>

          <p
            class="w-full text-center text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
          >
            لن تظهر لك مؤشرات الأخطاء أثناء القراءة حتى لا تتشتت.
          </p>

          <TasmeeWaveform
            :state="isPaused ? 'paused' : 'listening'"
            :levels="waveformLevels"
          />

          <div
            class="inline-flex items-center gap-[var(--sqc-dimension-spacing-8)] rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-action-secondary)] px-[var(--sqc-dimension-spacing-12)] py-[var(--sqc-dimension-spacing-8)] text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-brand)]"
          >
            التلميحات ستُفعّل لاحقًا
          </div>
        </section>

        <div class="min-h-[16px] flex-1" />

        <BaseButton
          v-if="isListening"
          size="large"
          variant="secondary"
          class="w-full"
          :disabled="finishing"
          @click="pauseSession"
        >
          إيقاف مؤقت
        </BaseButton>

        <BaseButton
          v-else-if="isPaused"
          size="large"
          variant="primary"
          class="w-full"
          :disabled="finishing"
          @click="resumeSession"
        >
          استئناف التسميع
        </BaseButton>

        <BaseButton
          size="large"
          variant="destructive"
          class="w-full"
          :loading="finishing"
          loading-text="جاري حفظ الجلسة"
          @click="endSession"
        >
          إنهاء الجلسة
        </BaseButton>
      </template>
    </template>
  </main>
</template>
