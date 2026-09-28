<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { BaseButton } from '@/shared/components'
import QuranMushafPane from '@/modules/quran/components/QuranMushafPane.vue'
import { useMushafPage } from '@/modules/quran/composables/useMushafPage'
import { getMushafPage, getQuranSurahMetadataByNumber } from '@/modules/quran/repositories/quran.repository'
import type { TeacherReview } from '../api/teacherReview'
import type { TrackingResult } from '../composables/useRecitationTracking'

const props = defineProps<{ review: TeacherReview; seconds: number; tracking: TrackingResult }>()
const emit = defineEmits<{ retry: []; selectAyah: [ayah: number] }>()
const selected = ref(props.review.start_ayah)
const follow = ref(true)
const pageNumber = ref(1)
const firstPage = ref(1)
const lastPage = ref(1)
const locating = ref(true)
const locationError = ref('')
const selectionMessage = ref('')
const candidates = computed(() => props.review.is_reviewer && ['submitted', 'in_review'].includes(props.review.status) ? props.tracking.candidates ?? [] : [])
const activeCandidate = computed(() => candidates.value.find(s => s.start <= props.seconds && props.seconds < s.end))
const active = computed(() => props.tracking.spans.find(s => s.start <= props.seconds && props.seconds < s.end) ?? activeCandidate.value)
const suspectedLocations = computed(() => candidates.value.map(c => `${props.review.surah_number}:${c.ayah}:${c.word}`))
const wordLocation = computed(() => follow.value && active.value ? `${props.review.surah_number}:${active.value.ayah}:${active.value.word}` : null)
const ayahs = computed(() => Array.from({ length: props.review.end_ayah - props.review.start_ayah + 1 }, (_, i) => props.review.start_ayah + i))
const { data: page, isPending, isError, refetch } = useMushafPage(pageNumber)
let locationVersion = 0
async function locate() {
  const version = ++locationVersion
  const word = wordLocation.value
  const verse = follow.value && active.value ? active.value.ayah : selected.value
  selected.value = verse
  if (word && page.value?.lines.some(line => line.words.some(w => w.location === word))) { locating.value = false; return }
  if (follow.value && !active.value && page.value && !locating.value) return
  locating.value = true
  locationError.value = ''
  try {
    const metadata = await getQuranSurahMetadataByNumber(props.review.surah_number)
    let number = metadata.ayahStartPages[String(verse)]
    if (!number) throw new Error('Missing ayah page')
    const endPage = metadata.ayahStartPages[String(verse + 1)] ?? metadata.lastPage
    if (word) {
      for (; number < endPage; number++) {
        const candidate = await getMushafPage(number)
        if (candidate.lines.some(line => line.words.some(w => w.location === word))) break
      }
    }
    if (version === locationVersion) {
      pageNumber.value = number
      firstPage.value = metadata.ayahStartPages[String(props.review.start_ayah)] ?? metadata.firstPage
      lastPage.value = metadata.ayahStartPages[String(props.review.end_ayah + 1)] ?? metadata.lastPage
    }
  } catch { if (version === locationVersion) locationError.value = 'تعذر تحديد صفحة الآية.' }
  finally { if (version === locationVersion) locating.value = false }
}
watch([wordLocation, follow], locate, { immediate: true })
function selectAyah(ayah: number, surah = props.review.surah_number, addNote = false) {
  if (surah !== props.review.surah_number || ayah < props.review.start_ayah || ayah > props.review.end_ayah) {
    selectionMessage.value = 'اختر آية ضمن نطاق هذا التسميع.'
    return
  }
  selectionMessage.value = ''
  selected.value = ayah
  follow.value = false
  void locate()
  if (addNote) emit('selectAyah', ayah)
}
async function turnPage(direction: number) {
  const target = Math.max(firstPage.value, Math.min(lastPage.value, pageNumber.value + direction))
  follow.value = false
  await nextTick()
  ++locationVersion
  locating.value = false
  pageNumber.value = target
}
</script>

<template>
  <section class="recitation-workspace" aria-label="المصحف مع التسجيل">
    <div class="recitation-toolbar">
      <h2 class="font-semibold">المصحف</h2>
      <label class="flex items-center gap-2 text-sm"><input v-model="follow" type="checkbox"> متابعة تلقائية</label>
      <label for="mushaf-ayah" class="sr-only">تصفّح الآية</label>
      <select id="mushaf-ayah" :value="selected" class="teacher-field !min-h-10 !w-auto !p-2 text-sm" @change="selectAyah(Number(($event.target as HTMLSelectElement).value))">
        <option v-for="number in ayahs" :key="number" :value="number">الآية {{ number }}</option>
      </select>
    </div>
    <div class="recitation-status">
    <p v-if="candidates.length">أحمر منقّط: اختلاف محتمل يحتاج مراجعة · {{ candidates.length }}</p>
    <p v-if="['idle', 'queued', 'processing'].includes(tracking.state)" role="status">جارٍ تجهيز التتبّع التلقائي… يمكنك الاستماع أثناء الانتظار.</p>
    <template v-else-if="tracking.state === 'failed'">
      <p role="alert">تعذر تجهيز التتبّع التلقائي. التسجيل والملاحظات متاحان.</p>
      <BaseButton variant="secondary" @click="emit('retry')">إعادة تجهيز التتبّع</BaseButton>
    </template>
    <p v-else-if="tracking.state === 'unmatched'" role="status">لم نستطع تحديد مواضع موثوقة في هذا التسجيل؛ لن نعرض مؤشرًا تخمينيًا.</p>
    <p v-if="tracking.state === 'ready'" role="status">{{ selectionMessage || (!follow ? 'التتبّع متوقف أثناء التصفح. فعّل المتابعة للعودة إلى الصوت.' : activeCandidate ? `اختلاف محتمل · الآية ${activeCandidate.ayah} · يحتاج استماعك` : active ? `موضع التلاوة: الآية ${active.ayah} · الكلمة ${active.word}` : 'بانتظار موضع واضح في الصوت') }}</p>
    </div>
    <div class="recitation-canvas">
    <p v-if="locating || isPending">جارٍ تحميل المصحف…</p>
    <div v-else-if="locationError || isError" role="alert">
      <p>{{ locationError || 'تعذر تحميل صفحة المصحف أو خطّها.' }}</p>
      <BaseButton variant="secondary" @click="locationError ? locate() : refetch()">إعادة المحاولة</BaseButton>
    </div>
    <QuranMushafPane v-else-if="page" class="recitation-mushaf" :page="page"
      :saved-verse-key="follow && active ? `${review.surah_number}:${active.ayah}` : null"
      marker-label="موضع التلاوة" :playback-word-location="wordLocation"
      :suspected-word-locations="suspectedLocations"
      @select-ayah="selectAyah($event.ayahNumber, $event.surahNumber, true)" />
    </div>
    <nav v-if="lastPage > firstPage" class="flex items-center justify-between gap-2" aria-label="صفحات نطاق التسميع">
      <BaseButton variant="secondary" :disabled="locating || pageNumber <= firstPage" @click="turnPage(-1)">الصفحة السابقة</BaseButton>
      <span class="text-sm">صفحة {{ pageNumber }}</span>
      <BaseButton variant="secondary" :disabled="locating || pageNumber >= lastPage" @click="turnPage(1)">الصفحة التالية</BaseButton>
    </nav>
    <slot name="transport" />
    <details class="px-4 pb-3 text-xs leading-6">
      <summary class="cursor-pointer">عن ألوان المتابعة</summary>
      <p>الأزرق: موضع الصوت التقديري. الأحمر المنقّط: اختلاف محتمل يحتاج استماعك؛ قد يكون خطأ تعرّف وليس خطأ القارئ. عدم ظهور الأحمر لا يعني صحة التلاوة كاملة. يتوقف المؤشر عند غياب موضع موثوق.</p>
    </details>
  </section>
</template>

<style scoped>
.recitation-workspace { min-width: 0; overflow: hidden; border-radius: 16px; background: var(--sqc-color-background-elevated); }
.recitation-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 16px 8px; flex-wrap: wrap; }
.recitation-status { padding: 0 16px 10px; font-size: 12px; line-height: 1.7; color: var(--sqc-color-text-secondary); }
.recitation-canvas { height: clamp(580px, 72dvh, 760px); padding: 0 8px; }
.recitation-mushaf, .recitation-mushaf :deep(article) { height: 100% !important; }
</style>
