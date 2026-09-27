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
const active = computed(() => props.tracking.spans.find(s => s.start <= props.seconds && props.seconds < s.end))
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
function selectAyah(ayah: number, surah = props.review.surah_number) {
  if (surah !== props.review.surah_number || ayah < props.review.start_ayah || ayah > props.review.end_ayah) {
    selectionMessage.value = 'اختر آية ضمن نطاق هذا التسميع.'
    return
  }
  selectionMessage.value = ''
  selected.value = ayah
  follow.value = false
  void locate()
  emit('selectAyah', ayah)
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
  <section class="teacher-card min-w-0" aria-label="المصحف مع التسجيل">
    <h2>المصحف يتابع التلاوة</h2>
    <p>يتحرك التحديد تلقائيًا مع الصوت بعد تجهيز التتبّع. الموضع تقديري للمساعدة في المتابعة، والتقييم للمراجع.</p>
    <p v-if="['idle', 'queued', 'processing'].includes(tracking.state)" role="status">جارٍ تجهيز التتبّع التلقائي… يمكنك الاستماع أثناء الانتظار.</p>
    <template v-else-if="tracking.state === 'failed'">
      <p role="alert">تعذر تجهيز التتبّع التلقائي. التسجيل والملاحظات متاحان.</p>
      <BaseButton variant="secondary" @click="emit('retry')">إعادة تجهيز التتبّع</BaseButton>
    </template>
    <p v-else-if="tracking.state === 'unmatched'" role="status">لم نستطع تحديد مواضع موثوقة في هذا التسجيل؛ لن نعرض مؤشرًا تخمينيًا.</p>
    <div class="flex flex-wrap items-center gap-3">
      <label class="flex items-center gap-2 text-sm"><input v-model="follow" type="checkbox"> متابعة التلاوة تلقائيًا</label>
      <label for="mushaf-ayah">تصفّح الآية</label>
      <select id="mushaf-ayah" :value="selected" class="teacher-field !w-auto" @change="selectAyah(Number(($event.target as HTMLSelectElement).value))">
        <option v-for="number in ayahs" :key="number" :value="number">{{ number }}</option>
      </select>
    </div>
    <p v-if="tracking.state === 'ready'" role="status">{{ selectionMessage || (!follow ? 'التتبّع متوقف أثناء التصفح. فعّل المتابعة للعودة إلى الصوت.' : active ? `موضع التلاوة: الآية ${active.ayah} · الكلمة ${active.word}` : 'لا يوجد موضع مؤكّد عند هذه اللحظة؛ التحديد متوقف حتى تتضح التلاوة.') }}</p>
    <p v-if="locating || isPending">جارٍ تحميل المصحف…</p>
    <div v-else-if="locationError || isError" role="alert">
      <p>{{ locationError || 'تعذر تحميل صفحة المصحف أو خطّها.' }}</p>
      <BaseButton variant="secondary" @click="locationError ? locate() : refetch()">إعادة المحاولة</BaseButton>
    </div>
    <QuranMushafPane v-else-if="page" class="recitation-mushaf" :page="page"
      :saved-verse-key="follow && active ? `${review.surah_number}:${active.ayah}` : null"
      marker-label="موضع التلاوة" :playback-word-location="wordLocation"
      @select-ayah="selectAyah($event.ayahNumber, $event.surahNumber)" />
    <nav v-if="lastPage > firstPage" class="flex items-center justify-between gap-2" aria-label="صفحات نطاق التسميع">
      <BaseButton variant="secondary" :disabled="locating || pageNumber <= firstPage" @click="turnPage(-1)">الصفحة السابقة</BaseButton>
      <span class="text-sm">صفحة {{ pageNumber }}</span>
      <BaseButton variant="secondary" :disabled="locating || pageNumber >= lastPage" @click="turnPage(1)">الصفحة التالية</BaseButton>
    </nav>
  </section>
</template>

<style scoped>
.recitation-mushaf { height: 640px !important; }
.recitation-mushaf :deep(article) { height: 640px !important; }
@media (min-width: 768px) {
  .recitation-mushaf, .recitation-mushaf :deep(article) { height: 760px !important; }
}
</style>
