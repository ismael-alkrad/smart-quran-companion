<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getQuranSurahMetadata } from '@/modules/quran/repositories/quran.repository'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import type { QuranSurahMetadata } from '@/modules/quran/types/mushaf'
import { toArabicNumber } from '@/modules/quran/utils/number'
import { BaseAppBar, BaseBanner, BaseButton, BaseLoading } from '@/shared/components'
import '../teacher-review.css'

const route = useRoute()
const router = useRouter()
const surahs = ref<QuranSurahMetadata[]>([])
const surah = ref(Number(route.query.surah) || 1)
const start = ref(1)
const end = ref(1)
const loading = ref(true)
const failed = ref(false)
const current = computed(() => surahs.value.find(s => s.surahNumber === surah.value))
const valid = computed(() => current.value && Number.isInteger(start.value) && Number.isInteger(end.value)
  && start.value >= 1 && end.value >= start.value && end.value <= current.value.ayahCount)
watch(surah, () => { start.value = 1; end.value = Math.min(5, current.value?.ayahCount ?? 1) })
async function load() {
  loading.value = true
  failed.value = false
  try {
    surahs.value = (await getQuranSurahMetadata()).surahs
    if (!current.value) surah.value = 1
    end.value = Math.min(5, current.value?.ayahCount ?? 1)
  } catch { failed.value = true }
  finally { loading.value = false }
}
function continueToSetup() {
  if (!valid.value) return
  void router.push({ path: '/tasmee/solo/setup', query: {
    practice: '1', surah: String(surah.value), start: String(start.value), end: String(end.value),
  } })
}
onMounted(load)
</script>

<template>
  <main dir="rtl" class="teacher-page">
    <BaseAppBar type="back" title="اختيار مقطع التسميع" @back="router.push('/tasmee')" />
    <BaseLoading v-if="loading" label="جارٍ تحميل السور" />
    <template v-else-if="failed">
      <BaseBanner tone="error" title="تعذر تحميل السور" body="تحقق من الاتصال وأعد المحاولة." />
      <BaseButton @click="load">إعادة المحاولة</BaseButton>
    </template>
    <form v-else class="teacher-card" @submit.prevent="continueToSetup">
      <h1>سمّع المقطع الذي تختاره</h1>
      <p>اختر سورة وآياتها، وسجّلها ثم أرسلها لمدرّسك أو صاحبك. هذا التسميع مستقل عن خطة حفظ اليوم.</p>
      <label for="scope-surah">السورة</label>
      <select id="scope-surah" v-model.number="surah" class="teacher-field">
        <option v-for="item in surahs" :key="item.surahNumber" :value="item.surahNumber">{{ getSurahNameArabic(item.surahNumber) }} · {{ toArabicNumber(item.ayahCount) }} آية</option>
      </select>
      <div class="grid grid-cols-2 gap-3">
        <div><label for="scope-start">من الآية</label><input id="scope-start" v-model.number="start" type="number" min="1" :max="current?.ayahCount" step="1" required class="teacher-field mt-2" /></div>
        <div><label for="scope-end">إلى الآية</label><input id="scope-end" v-model.number="end" type="number" :min="start || 1" :max="current?.ayahCount" step="1" required class="teacher-field mt-2" /></div>
      </div>
      <BaseButton type="button" variant="secondary" @click="start = 1; end = current?.ayahCount ?? 1">اختيار السورة كاملة</BaseButton>
      <p v-if="valid" aria-live="polite">سورة {{ getSurahNameArabic(surah) }} · الآيات {{ toArabicNumber(start) }}–{{ toArabicNumber(end) }}</p>
      <p v-else role="alert">اختر بداية ونهاية صحيحتين ضمن آيات السورة.</p>
      <BaseButton type="submit" size="large" :disabled="!valid">متابعة لتجهيز التسجيل</BaseButton>
    </form>
  </main>
</template>
