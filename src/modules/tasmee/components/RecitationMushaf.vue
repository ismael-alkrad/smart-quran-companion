<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BaseButton } from '@/shared/components'
import QuranMushafPane from '@/modules/quran/components/QuranMushafPane.vue'
import { useMushafPage } from '@/modules/quran/composables/useMushafPage'
import { getQuranSurahMetadataByNumber } from '@/modules/quran/repositories/quran.repository'
import type { QuranHifzReaderContext } from '@/modules/quran/types/reader'
import { recordingTime, type TeacherReview } from '../api/teacherReview'

const props = defineProps<{ review: TeacherReview; seconds: number; editable: boolean; busy: boolean; audioReady: boolean }>()
const emit = defineEmits<{
  mark: [ayah: number]
  remove: [name: string]
  seek: [seconds: number]
  selectAyah: [ayah: number]
}>()
const selected = ref(props.review.start_ayah)
const follow = ref(true)
const pageNumber = ref(1)
const firstPage = ref(1)
const lastPage = ref(1)
const locating = ref(true)
const locationError = ref('')
const selectionMessage = ref('')
const markers = computed(() => [...props.review.markers].sort((a, b) => a.at_seconds - b.at_seconds))
const active = computed(() => markers.value.filter(m => m.at_seconds <= props.seconds).at(-1))
const highlighted = computed(() => follow.value ? active.value?.ayah : selected.value)
const displayedAyah = computed(() => highlighted.value ?? props.review.start_ayah)
const ayahs = computed(() => Array.from({ length: props.review.end_ayah - props.review.start_ayah + 1 }, (_, i) => props.review.start_ayah + i))
const { data: page, isPending, isError, refetch } = useMushafPage(pageNumber)
const highlight = computed<QuranHifzReaderContext | null>(() => highlighted.value ? {
  mode: 'hifz', assignmentName: props.review.name, surahNumber: props.review.surah_number,
  startAyah: highlighted.value, endAyah: highlighted.value,
} : null)
let locationVersion = 0
async function locate() {
  const version = ++locationVersion
  locating.value = true
  locationError.value = ''
  try {
    const metadata = await getQuranSurahMetadataByNumber(props.review.surah_number)
    const number = metadata.ayahStartPages[String(displayedAyah.value)]
    if (!number) throw new Error('Missing ayah page')
    if (version === locationVersion) {
      pageNumber.value = number
      firstPage.value = metadata.ayahStartPages[String(props.review.start_ayah)] ?? metadata.firstPage
      lastPage.value = metadata.ayahStartPages[String(props.review.end_ayah + 1)] ?? metadata.lastPage
    }
  } catch { if (version === locationVersion) locationError.value = 'تعذر تحديد صفحة الآية.' }
  finally { if (version === locationVersion) locating.value = false }
}
watch([() => props.review.name, displayedAyah], locate, { immediate: true })
function selectAyah(ayah: number, surah = props.review.surah_number) {
  if (surah !== props.review.surah_number || ayah < props.review.start_ayah || ayah > props.review.end_ayah) {
    selectionMessage.value = 'اختر آية ضمن نطاق هذا التسميع.'
    return
  }
  selectionMessage.value = ''
  selected.value = ayah
  follow.value = false
  emit('selectAyah', ayah)
}
function turnPage(direction: number) {
  selected.value = displayedAyah.value
  follow.value = false
  pageNumber.value = Math.max(firstPage.value, Math.min(lastPage.value, pageNumber.value + direction))
}
</script>

<template>
  <section class="teacher-card min-w-0" aria-label="المصحف مع التسجيل">
    <h2>المصحف مع التسجيل</h2>
    <p>اختر الآية وثبّت وقتها أثناء الاستماع. المؤشر يتبع المواضع المثبّتة يدويًا؛ لا يكتشف الأخطاء ولا يتعرّف على الكلمات تلقائيًا.</p>
    <div class="flex flex-wrap items-center gap-3">
      <label for="mushaf-ayah">انتقل إلى الآية</label>
      <select id="mushaf-ayah" :value="displayedAyah" class="teacher-field !w-auto" @change="selectAyah(Number(($event.target as HTMLSelectElement).value))">
        <option v-for="number in ayahs" :key="number" :value="number">{{ number }}</option>
      </select>
      <label class="flex items-center gap-2 text-sm"><input v-model="follow" type="checkbox"> متابعة المواضع المثبّتة</label>
    </div>
    <p role="status">{{ selectionMessage || (follow ? active ? `آخر موضع مثبّت: الآية ${active.ayah} عند ${recordingTime(active.at_seconds)}` : 'لا يوجد موضع مثبّت عند وقت التشغيل الحالي.' : `تحديد يدوي: الآية ${selected}`) }}</p>
    <BaseButton v-if="editable" :disabled="busy || !audioReady" @click="emit('mark', displayedAyah)">تثبيت الآية {{ displayedAyah }} عند {{ recordingTime(seconds) }}</BaseButton>
    <p v-if="locating || isPending">جارٍ تحميل المصحف…</p>
    <div v-else-if="locationError || isError" role="alert">
      <p>{{ locationError || 'تعذر تحميل صفحة المصحف أو خطّها.' }}</p>
      <BaseButton variant="secondary" @click="locationError ? locate() : refetch()">إعادة المحاولة</BaseButton>
    </div>
    <QuranMushafPane v-else-if="page" class="recitation-mushaf" :page="page"
      :saved-verse-key="highlighted ? `${review.surah_number}:${highlighted}` : null"
      :marker-label="follow ? 'موضع مثبّت' : 'تحديد يدوي'" :hifz-context="highlight"
      @select-ayah="selectAyah($event.ayahNumber, $event.surahNumber)" />
    <nav v-if="lastPage > firstPage" class="flex items-center justify-between gap-2" aria-label="صفحات نطاق التسميع">
      <BaseButton variant="secondary" :disabled="locating || pageNumber <= firstPage" @click="turnPage(-1)">الصفحة السابقة</BaseButton>
      <span class="text-sm">صفحة {{ pageNumber }}</span>
      <BaseButton variant="secondary" :disabled="locating || pageNumber >= lastPage" @click="turnPage(1)">الصفحة التالية</BaseButton>
    </nav>
    <details v-if="markers.length">
      <summary class="cursor-pointer py-2">المواضع المثبّتة ({{ markers.length }})</summary>
      <ul class="grid max-h-64 gap-2 overflow-auto">
        <li v-for="marker in markers" :key="marker.name" class="teacher-review-link">
          <button type="button" :disabled="!audioReady" class="text-start underline disabled:opacity-50" @click="follow = true; emit('seek', marker.at_seconds)">الآية {{ marker.ayah }} · {{ recordingTime(marker.at_seconds) }} · {{ marker.author_name }}</button>
          <button v-if="editable" type="button" :disabled="busy" class="text-start text-sm underline" @click="emit('remove', marker.name)">حذف موضع الآية {{ marker.ayah }} عند {{ recordingTime(marker.at_seconds) }}</button>
        </li>
      </ul>
    </details>
    <p v-if="editable">المواضع مسودة حتى نشر المراجعة. تثبيت آية في الوقت نفسه يستبدل الموضع السابق، ويمكن تثبيت الآية مجددًا عند تكرارها.</p>
  </section>
</template>

<style scoped>
.recitation-mushaf { height: 640px !important; }
.recitation-mushaf :deep(article) { height: 640px !important; }
@media (min-width: 768px) {
  .recitation-mushaf, .recitation-mushaf :deep(article) { height: 760px !important; }
}
</style>
