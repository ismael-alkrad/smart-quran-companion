<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import TasmeeAudioQuality, {
  type TasmeeAudioQualityState,
} from '@/modules/tasmee/components/TasmeeAudioQuality.vue'
import TasmeeStateHeader from '@/modules/tasmee/components/TasmeeStateHeader.vue'
import TasmeeWaveform from '@/modules/tasmee/components/TasmeeWaveform.vue'
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
  loading,
  failed,
  error,
  refresh,
} = useTasmeeDailyAssignment()

const qualityState = ref<TasmeeAudioQualityState>('idle')
const levels = ref<number[]>(Array.from({ length: 9 }, () => 0.12))
const checking = computed(() => qualityState.value === 'checking')
const canContinue = computed(() => qualityState.value === 'good')

let mediaStream: MediaStream | null = null
let audioContext: AudioContext | null = null
let animationFrame = 0
let autoStarted = false
let runId = 0

function resetLevels() {
  levels.value = Array.from({ length: 9 }, () => 0.12)
}

async function stopCapture() {
  runId += 1

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = 0
  }

  mediaStream?.getTracks().forEach(track => track.stop())
  mediaStream = null

  if (audioContext && audioContext.state !== 'closed') {
    try {
      await audioContext.close()
    } catch {
      // The stream has already been released.
    }
  }

  audioContext = null
}

function goBack() {
  const current = assignment.value

  void router.push({
    name: 'tasmee-solo-setup',
    query: current
      ? { assignment: current.name }
      : {},
  })
}

function continueToReady() {
  const current = assignment.value

  if (!current || !canContinue.value) return

  void router.push({
    name: 'tasmee-solo-ready',
    query: {
      assignment: current.name,
    },
  })
}

function classifyPermissionError(error: unknown) {
  if (
    error instanceof DOMException
    && (
      error.name === 'NotAllowedError'
      || error.name === 'SecurityError'
    )
  ) {
    return 'denied' as const
  }

  return 'unsupported' as const
}

async function runMicCheck() {
  if (checking.value) return

  await stopCapture()
  resetLevels()

  if (
    typeof navigator === 'undefined'
    || !navigator.mediaDevices?.getUserMedia
    || typeof AudioContext === 'undefined'
  ) {
    qualityState.value = 'unsupported'
    return
  }

  qualityState.value = 'checking'
  const currentRun = ++runId

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    })

    if (currentRun !== runId) {
      stream.getTracks().forEach(track => track.stop())
      return
    }

    mediaStream = stream

    const context = new AudioContext()
    audioContext = context

    if (context.state === 'suspended') {
      await context.resume()
    }

    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.5
    source.connect(analyser)

    const samples = new Float32Array(analyser.fftSize)
    const startedAt = performance.now()

    let frameCount = 0
    let rmsTotal = 0
    let clippingFrames = 0

    await new Promise<void>((resolve) => {
      const sample = () => {
        if (currentRun !== runId) {
          resolve()
          return
        }

        analyser.getFloatTimeDomainData(samples)

        let squareTotal = 0
        let peak = 0

        for (const sampleValue of samples) {
          const absoluteValue = Math.abs(sampleValue)
          squareTotal += sampleValue * sampleValue
          peak = Math.max(peak, absoluteValue)
        }

        const rms = Math.sqrt(squareTotal / samples.length)
        rmsTotal += rms
        frameCount += 1

        if (peak >= 0.985) {
          clippingFrames += 1
        }

        const chunkSize = Math.floor(samples.length / 9)
        levels.value = Array.from({ length: 9 }, (_, index) => {
          const start = index * chunkSize
          const end = index === 8
            ? samples.length
            : start + chunkSize

          let total = 0

          for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
            total += Math.abs(samples[sampleIndex] ?? 0)
          }

          const average = total / Math.max(1, end - start)
          return Math.min(1, Math.max(0.08, average * 8))
        })

        if (performance.now() - startedAt >= 4000) {
          resolve()
          return
        }

        animationFrame = requestAnimationFrame(sample)
      }

      sample()
    })

    if (currentRun !== runId) return

    const averageRms = rmsTotal / Math.max(1, frameCount)
    const clippingRatio = clippingFrames / Math.max(1, frameCount)

    if (clippingRatio >= 0.08) {
      qualityState.value = 'clipping'
    } else if (averageRms < 0.015) {
      qualityState.value = 'quiet'
    } else {
      qualityState.value = 'good'
    }
  } catch (error) {
    if (currentRun === runId) {
      qualityState.value = classifyPermissionError(error)
    }
  } finally {
    if (currentRun === runId) {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
      }

      mediaStream?.getTracks().forEach(track => track.stop())
      mediaStream = null

      if (audioContext && audioContext.state !== 'closed') {
        try {
          await audioContext.close()
        } catch {
          // The audio context has already been released.
        }
      }

      audioContext = null
    }
  }
}

watch(
  () => [assignment.value?.name ?? null, loading.value] as const,
  ([assignmentName, isLoading]) => {
    if (!assignmentName || isLoading || autoStarted) return

    autoStarted = true
    void runMicCheck()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  void stopCapture()
})
</script>

<template>
  <main
    dir="rtl"
    class="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col gap-[var(--sqc-dimension-spacing-16)] bg-[var(--sqc-color-background-primary)] px-[var(--sqc-dimension-spacing-16)] py-[var(--sqc-dimension-spacing-24)] [font-family:var(--sqc-font-family-ui)]"
  >
    <BaseAppBar
      type="back"
      title="فحص الميكروفون"
      class="shrink-0"
      @back="goBack"
    />

    <div
      v-if="loading"
      class="grid flex-1 place-items-center"
    >
      <BaseLoading label="جاري تجهيز فحص الميكروفون" />
    </div>

    <section
      v-else-if="failed || !assignment"
      class="flex flex-1 flex-col justify-center gap-[var(--sqc-dimension-spacing-16)]"
    >
      <BaseBanner
        tone="error"
        title="تعذر تجهيز فحص الميكروفون"
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
        state="mic-check"
        title="اختبار الميكروفون"
        subtitle="تحدث لبضع ثوانٍ للتأكد من وضوح الصوت قبل بدء التسميع."
      />

      <TasmeeWaveform :levels="levels" />

      <TasmeeAudioQuality :state="qualityState" />

      <BaseBanner
        tone="info"
        title="هذه خطوة تقنية فقط"
        body="لن يتم تقييم الحفظ أو تسجيل أخطاء أثناء فحص الميكروفون."
      />

      <div class="min-h-[16px] flex-1" />

      <BaseButton
        size="large"
        variant="secondary"
        class="w-full"
        :disabled="checking"
        @click="runMicCheck"
      >
        إعادة الاختبار
      </BaseButton>

      <BaseButton
        size="large"
        variant="primary"
        class="w-full"
        :disabled="!canContinue"
        @click="continueToReady"
      >
        متابعة
      </BaseButton>
    </template>
  </main>
</template>
