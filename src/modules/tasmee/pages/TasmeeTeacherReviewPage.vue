<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { BaseAppBar, BaseBanner, BaseButton, BaseInput, BaseLoading } from '@/shared/components'
import { smartQuranApiUrl } from '@/shared/api'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { getTeacherReview, teacherAction, reviewLabels, noteLabels, recordingTime, type TeacherReview } from '../api/teacherReview'
import '../teacher-review.css'
import RecitationMushaf from '../components/RecitationMushaf.vue'
import { useRecitationTracking, type TrackingCandidate } from '../composables/useRecitationTracking'

const route = useRoute()
const router = useRouter()
const review = ref<TeacherReview | null>(null)
const { tracking, prepare: prepareTracking, stop: stopTracking } = useRecitationTracking()
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const audioError = ref('')
const audioLoading = ref(false)
const audioUrl = ref('')
const player = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const audioReady = ref(false)
const audioDuration = ref(0)
const playbackRate = ref('1')
const noteComposerOpen = ref(false)
const noteComposer = ref<HTMLElement | null>(null)
const reviewSummary = ref<HTMLElement | null>(null)
const seconds = ref(0)
const noteTime = ref(0)
const ayah = ref('')
const category = ref('memorization')
const body = ref('')
const summary = ref('')
let audioAbort: AbortController | null = null
let loadVersion = 0
const editable = computed(() => review.value?.is_reviewer &&
  ['submitted', 'in_review'].includes(review.value.status))
const notes = computed(() => [...(review.value?.notes ?? [])].sort((a, b) => a.at_seconds - b.at_seconds))
const dirty = computed(() => editable.value && (body.value.trim() || summary.value.trim()))
const candidates = computed(() => editable.value ? tracking.value.candidates ?? [] : [])
async function load() {
  const version = ++loadVersion
  loading.value = true
  error.value = ''
  review.value = null
  stopTracking()
  audioAbort?.abort()
  audioLoading.value = false
  audioReady.value = false
  playing.value = false
  audioError.value = ''
  audioDuration.value = 0
  noteComposerOpen.value = false
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = ''
  body.value = ''
  summary.value = ''
  seconds.value = 0
  noteTime.value = 0
  ayah.value = ''
  try {
    const result = await getTeacherReview(String(route.params.name))
    if (version === loadVersion) {
      review.value = result
      void prepareTracking(result.name)
      void loadAudio()
    }
  } catch { if (version === loadVersion) error.value = 'تعذر فتح المراجعة. تحقق من الاتصال وصلاحية الوصول.' }
  finally { if (version === loadVersion) loading.value = false }
}
async function loadAudio() {
  if (!review.value || audioLoading.value) return
  audioLoading.value = true
  audioError.value = ''
  const controller = new AbortController()
  audioAbort = controller
  const name = review.value.name
  try {
    const response = await fetch(smartQuranApiUrl('teacher_review.recording') +
      '?name=' + encodeURIComponent(name), { credentials: 'same-origin', signal: controller.signal })
    if (!response.ok) throw new Error()
    const blob = await response.blob()
    if (review.value?.name !== name || controller.signal.aborted) return
    if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = URL.createObjectURL(blob)
  } catch (cause) {
    if (!controller.signal.aborted && audioAbort === controller && !(cause instanceof DOMException && cause.name === 'AbortError')) audioError.value = 'تعذر تحميل التسجيل. أعد المحاولة.'
  } finally { if (audioAbort === controller) audioLoading.value = false }
}
const duration = computed(() => Number.isFinite(audioDuration.value) && audioDuration.value > 0
  ? audioDuration.value : review.value?.duration_seconds || 0)
async function togglePlayback() {
  if (!player.value || !audioReady.value) return
  if (!player.value.paused) { player.value.pause(); return }
  try { await player.value.play() } catch { audioError.value = 'تعذر بدء التشغيل. اضغط تشغيل مرة أخرى.' }
}
function scrub(at: number) {
  if (!player.value || !audioReady.value) return
  player.value.currentTime = Math.max(0, Math.min(duration.value, at))
  seconds.value = player.value.currentTime
}
function setPlaybackRate() { if (player.value) player.value.playbackRate = Number(playbackRate.value) }
function onPlayback() {
  playing.value = true
  if (review.value?.is_reviewer && review.value.status === 'submitted') void action('begin_review', {})
}
async function openNote(verse?: number) {
  if (!body.value.trim()) {
    markTime()
    ayah.value = String(verse ?? tracking.value.spans.find(s => s.start <= seconds.value && seconds.value < s.end)?.ayah ?? '')
  } else player.value?.pause()
  noteComposerOpen.value = true
  await nextTick()
  noteComposer.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  noteComposer.value?.querySelector('textarea')?.focus({ preventScroll: true })
}
function finishListening() {
  player.value?.pause()
  reviewSummary.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
async function draftCandidate(candidate: TrackingCandidate) {
  if (body.value.trim()) { await openNote(); return }
  scrub(candidate.start)
  await openNote(candidate.ayah)
  body.value = `راجع موضع كلمة «${candidate.expected}». ظهر اختلاف محتمل في التفريغ: «${candidate.heard}».`
}
async function seek(at: number) {
  if (!player.value) return
  player.value.currentTime = at
  seconds.value = at
  try { await player.value.play() } catch { audioError.value = 'اضغط تشغيل للاستماع إلى الملاحظة.' }
}
function markTime() {
  noteTime.value = player.value?.currentTime ?? seconds.value
  seconds.value = noteTime.value
  player.value?.pause()
}
function reviewDate(value: string) {
  return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value.replace(' ', 'T')))
}
async function action(method: string, params: Record<string, string | number>) {
  if (!review.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    review.value = await teacherAction<TeacherReview>(method, { name: review.value.name, ...params })
    if (method === 'add_note') body.value = ''
    if (method === 'publish') summary.value = ''
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'تعذر حفظ المراجعة.' }
  finally { busy.value = false }
}
function confirmLeave() {
  return !dirty.value || window.confirm('لديك نص لم يُحفظ. هل تريد مغادرة المراجعة؟')
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value) { event.preventDefault(); event.returnValue = '' }
}
window.addEventListener('beforeunload', beforeUnload)
onBeforeRouteLeave(confirmLeave)
watch(() => route.params.name, load, { immediate: true })
onBeforeUnmount(() => {
  ++loadVersion
  audioAbort?.abort()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<template>
  <main dir="rtl" class="teacher-page teacher-review-page">
    <BaseAppBar type="back" title="مراجعة التسميع" @back="router.push('/tasmee')" />
    <BaseLoading v-if="loading" label="جارٍ تحميل المراجعة" />
    <BaseBanner v-if="error" tone="error" title="تعذر إكمال الطلب" :body="error" />
    <BaseButton v-if="error && !review" variant="secondary" @click="load">إعادة المحاولة</BaseButton>
    <template v-if="review">
      <BaseBanner v-if="!review.is_reviewer" tone="info"
        :title="review.status === 'changes_requested' ? 'مراجعتك جاهزة — تدرّب ثم أعد التسميع' : review.status === 'approved' ? 'اكتملت مراجعة تسميعك' : 'تم إرسال تسجيلك للمراجعة'"
        :body="['approved', 'changes_requested'].includes(review.status) ? 'استمع للملاحظات من أوقاتها أدناه واقرأ رسالة المراجع.' : 'تسجيلك عند ' + review.teacher_name + '. ستظهر ملاحظاته هنا بعد نشر المراجعة. تقدر ترجع لهذه الصفحة من تسميعاتي.'" />
      <div class="teacher-review-columns">
      <div class="grid min-w-0 content-start gap-4">
      <section class="review-context">
        <span class="teacher-eyebrow">{{ reviewLabels[review.status] }}</span>
        <h1>سورة {{ getSurahNameArabic(review.surah_number) }}</h1>
        <p>الآيات {{ review.start_ayah }}–{{ review.end_ayah }} · {{ recordingTime(review.duration_seconds) }}</p>
        <p>{{ review.is_reviewer ? 'تسميع ' + review.student_name : 'يراجع لك ' + review.teacher_name }}</p>
        <RouterLink v-if="review.parent_review" :to="'/tasmee/reviews/' + review.parent_review" class="teacher-eyebrow underline">العودة للمحاولة السابقة وملاحظاتها</RouterLink>
      </section>
      <RecitationMushaf :key="review.name" :review="review" :seconds="seconds" :tracking="tracking"
        @retry="prepareTracking(review.name)" @select-ayah="openNote($event)">
        <template #transport>
          <section class="recitation-transport" aria-label="أدوات الاستماع والمراجعة">
            <audio v-if="audioUrl" ref="player" :src="audioUrl" preload="auto" class="hidden" aria-label="تسجيل التسميع"
              @loadedmetadata="audioDuration = player?.duration ?? 0; audioReady = true; setPlaybackRate()"
              @durationchange="audioDuration = player?.duration ?? 0"
              @play="onPlayback" @pause="playing = false" @ended="playing = false"
              @timeupdate="seconds = player?.currentTime ?? 0" @error="audioReady = false; audioError = 'تعذر تشغيل التسجيل. أعد المحاولة.'" />
            <div dir="ltr" class="flex items-center gap-3">
              <span class="text-xs tabular-nums">{{ recordingTime(seconds) }}</span>
              <input type="range" min="0" :max="duration" step="0.1" :value="seconds" :disabled="!audioReady" class="min-w-0 flex-1" aria-label="موضع تشغيل التسجيل" @input="scrub(Number(($event.target as HTMLInputElement).value))">
              <span class="text-xs tabular-nums">{{ recordingTime(duration) }}</span>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-2">
              <BaseButton :disabled="!audioReady" :loading="audioLoading" @click="togglePlayback">{{ playing ? 'إيقاف مؤقت' : 'تشغيل التلاوة' }}</BaseButton>
              <BaseButton variant="secondary" :disabled="!audioReady" @click="scrub(seconds - 5)">رجوع ٥ ثوانٍ</BaseButton>
              <select v-model="playbackRate" class="teacher-field !min-h-10 !w-auto !p-2 text-sm" aria-label="سرعة التلاوة" @change="setPlaybackRate">
                <option value="0.75">٠٫٧٥×</option><option value="1">١×</option><option value="1.25">١٫٢٥×</option><option value="1.5">١٫٥×</option>
              </select>
              <BaseButton v-if="editable" variant="secondary" :disabled="!audioReady" @click="openNote()">إضافة ملاحظة</BaseButton>
              <BaseButton v-if="editable" variant="secondary" @click="finishListening">مراجعة ونشر</BaseButton>
            </div>
            <p v-if="audioLoading" class="text-center text-sm" role="status">جارٍ تجهيز الصوت تلقائيًا…</p>
            <div v-if="audioError" role="alert" class="text-center text-sm">
              <p>{{ audioError }}</p><BaseButton variant="secondary" :disabled="audioLoading" @click="loadAudio">إعادة تحميل الصوت</BaseButton>
            </div>
          </section>
        </template>
      </RecitationMushaf>
      </div>
      <div class="grid min-w-0 content-start gap-4">
      <section class="teacher-card" aria-label="نشاط المراجعة">
        <h2>من راجع هذا التسميع؟</h2>
        <strong>{{ review.teacher_name }}</strong>
        <p v-if="review.reviewed_at">نشر المراجعة في {{ reviewDate(review.reviewed_at) }} · عدد الملاحظات: {{ notes.length }}</p>
        <p v-else-if="review.review_started_at">بدأ المراجعة في {{ reviewDate(review.review_started_at) }}. لم ينشرها بعد.</p>
        <p v-else-if="review.status === 'in_review'">بدأ المراجعة. وقت البداية غير مسجّل للمراجعات السابقة.</p>
        <p v-else>لم يبدأ المراجعة بعد.</p>
        <BaseButton v-if="editable && review.status === 'submitted'" variant="secondary" :disabled="busy" @click="action('begin_review', {})">بدء المراجعة</BaseButton>
      </section>
      <section v-if="candidates.length" class="teacher-card" aria-label="اختلافات محتملة للمراجعة">
        <h2>مواضع تحتاج انتباهك · {{ candidates.length }}</h2>
        <p>الأحمر المنقّط اقتراح آلي، وليس حكمًا على الطالب. استمع قبل إضافته إلى ملاحظاتك.</p>
        <article v-for="candidate in candidates" :key="candidate.id" class="teacher-review-link">
          <strong>الآية {{ candidate.ayah }} · «{{ candidate.expected }}»</strong>
          <p>التفريغ المحتمل: «{{ candidate.heard }}»</p>
          <div class="flex flex-wrap gap-2">
            <BaseButton variant="secondary" :disabled="!audioReady" @click="seek(Math.max(0, candidate.start - 0.5))">استمع للموضع {{ recordingTime(candidate.start) }}</BaseButton>
            <BaseButton variant="secondary" :disabled="!audioReady" @click="draftCandidate(candidate)">صياغة ملاحظة</BaseButton>
          </div>
        </article>
      </section>
      <section class="teacher-card">
        <h2>ملاحظات {{ review.is_reviewer ? 'المراجعة' : 'الشريك' }}</h2>
        <p v-if="editable">تُحفظ الملاحظات كمسودة. تظهر للطالب بعد نشر المراجعة.</p>
        <p v-if="!notes.length">{{ editable ? 'استمع للتسجيل وأضف ملاحظتك عند موضعها.' : ['submitted', 'in_review'].includes(review.status) ? 'ستظهر الملاحظات هنا بعد أن ينشر شريكك مراجعته.' : 'لم يضف شريكك ملاحظات زمنية.' }}</p>
        <article v-for="note in notes" :key="note.name" class="teacher-review-link">
          <div class="flex items-center justify-between gap-2">
            <strong>{{ noteLabels[note.category] }}{{ note.ayah ? ' · الآية ' + note.ayah : '' }}</strong>
            <button type="button" :disabled="!audioUrl" class="teacher-eyebrow rounded-lg p-2 underline disabled:opacity-50" :aria-label="'استمع عند ' + recordingTime(note.at_seconds)" @click="seek(note.at_seconds)">{{ recordingTime(note.at_seconds) }}</button>
          </div>
          <p class="whitespace-pre-wrap">{{ note.body }}</p>
          <p>{{ note.author_name }}<span v-if="note.added_at"> · {{ reviewDate(note.added_at) }}</span></p>
          <BaseButton v-if="editable" variant="secondary" :disabled="busy" @click="action('remove_note', { note: note.name })">حذف الملاحظة</BaseButton>
        </article>
        <p v-if="review.summary" class="whitespace-pre-wrap">{{ review.summary }}</p>
      </section>
      <section v-if="editable && noteComposerOpen" ref="noteComposer" class="teacher-card">
        <h2>إضافة ملاحظة</h2>
        <form class="grid gap-4" @submit.prevent="action('add_note', { at_seconds: noteTime, ayah, category, body })">
          <p>موضع الملاحظة: <b dir="ltr">{{ recordingTime(noteTime) }}</b></p>
          <BaseButton type="button" variant="secondary" :disabled="!audioUrl" @click="markTime">تثبيت موضع التشغيل {{ recordingTime(seconds) }}</BaseButton>
          <BaseInput v-model="ayah" type="number" label="رقم الآية (اختياري)" />
          <label for="note-category">نوع الملاحظة</label>
          <select id="note-category" v-model="category" class="teacher-field">
            <option v-for="(label, key) in noteLabels" :key="key" :value="key">{{ label }}</option>
          </select>
          <label for="note-body">ملاحظة للطالب</label>
          <textarea id="note-body" v-model="body" class="teacher-field" rows="3" maxlength="2000" required placeholder="ما الذي يحتاج إلى تدريب؟ وكيف يتدرّب عليه؟" />
          <BaseButton type="submit" :disabled="busy || !body.trim() || !audioUrl" :loading="busy">حفظ الملاحظة عند {{ recordingTime(noteTime) }}</BaseButton>
        </form>
      </section>
      <section v-if="editable" ref="reviewSummary" class="teacher-card">
        <h2>نشر المراجعة</h2>
        <label for="review-summary">رسالة ختامية للطالب (اختيارية)</label>
        <textarea id="review-summary" v-model="summary" class="teacher-field" rows="3" maxlength="2000" />
        <p>الاعتماد يخص هذا التسميع. لا يغيّر سجل الحفظ تلقائيًا.</p>
        <p v-if="body.trim()">احفظ الملاحظة المكتوبة أولًا أو امسحها قبل النشر.</p>
        <BaseButton :disabled="busy || !!body.trim()" @click="action('publish', { decision: 'approved', summary })">اعتماد التسميع ونشر المراجعة</BaseButton>
        <BaseButton variant="secondary" :disabled="busy || !!body.trim() || (!notes.length && !summary.trim())" @click="action('publish', { decision: 'changes_requested', summary })">طلب إعادة التسميع ونشر الملاحظات</BaseButton>
      </section>
      <section v-else-if="review.status === 'changes_requested' && !review.is_reviewer" class="teacher-card">
        <h2>محاولة جديدة</h2>
        <p>راجع الملاحظات ثم أعد تسجيل نطاق التسميع. ستُربط المحاولة الجديدة بهذه المراجعة.</p>
        <BaseButton @click="router.push({ path: '/tasmee/solo/setup', query: { retry: review.name, fresh: '1' } })">إعادة تسجيل التسميع</BaseButton>
      </section>
      </div>
      </div>
    </template>
  </main>
</template>
