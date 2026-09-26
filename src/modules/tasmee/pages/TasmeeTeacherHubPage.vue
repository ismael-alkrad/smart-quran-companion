<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { BaseAppBar, BaseBanner, BaseButton, BaseInput, BaseLoading } from '@/shared/components'
import { getTeacherDashboard, teacherAction, reviewLabels, type TeacherDashboard } from '../api/teacherReview'
import '../teacher-review.css'

const router = useRouter()
const data = ref<TeacherDashboard | null>(null)
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const email = ref('')
const filter = ref('all')
const offset = ref(0)
const visible = computed(() => data.value?.reviews.filter(r =>
  filter.value === 'all' || (filter.value === 'waiting'
    ? ['submitted', 'in_review'].includes(r.status) : r.status === filter.value)) ?? [])
async function load(more = false) {
  loading.value = true
  error.value = ''
  try {
    const nextOffset = more ? offset.value + 20 : 0
    const next = await getTeacherDashboard(nextOffset)
    if (more && data.value) next.reviews = [...data.value.reviews, ...next.reviews]
    data.value = next
    offset.value = nextOffset
  } catch { error.value = 'تعذر تحميل التسميعات. تحقق من الاتصال وأعد المحاولة.' }
  finally { loading.value = false }
}
async function action(method: string, params: Record<string, string>) {
  busy.value = true
  error.value = ''
  try {
    await teacherAction(method, params)
    email.value = ''
    await load()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'تعذر إكمال الطلب.' }
  finally { busy.value = false }
}
onMounted(() => load())
</script>

<template>
  <main dir="rtl" class="teacher-page">
    <BaseAppBar type="back" title="التسميع مع المدرّس" @back="router.push('/home')" />
    <section class="teacher-card">
      <span class="teacher-eyebrow">على وقتك، وبمتابعة مدرّسك</span>
      <h1>كل تسميع خطوة نحو الإتقان</h1>
      <p>سجّل مقررك، أرسله، وارجع لملاحظات المدرّس في مواضعها داخل التسجيل.</p>
      <BaseButton size="large" @click="router.push('/quran/hifz/daily-plan')">تسجيل مقرر اليوم</BaseButton>
    </section>
    <BaseBanner v-if="error" tone="error" title="تعذر إكمال الطلب" :body="error" />
    <BaseButton v-if="error" variant="secondary" @click="load()">إعادة المحاولة</BaseButton>
    <BaseLoading v-if="loading && !data" label="جارٍ تحميل التسميعات" />
    <template v-if="data">
      <section class="teacher-card">
        <h2>تسميعاتي ومراجعاتي</h2>
        <label for="review-filter" class="sr-only">تصفية التسميعات</label>
        <select id="review-filter" v-model="filter" class="teacher-field">
          <option value="all">كل التسميعات المحمّلة</option>
          <option value="waiting">بانتظار المراجعة</option>
          <option value="changes_requested">تحتاج إعادة</option>
          <option value="approved">معتمدة من المدرّس</option>
        </select>
        <p v-if="!visible.length">لا توجد تسميعات هنا بعد. تسجيلك القادم سيظهر هنا بعد إرساله.</p>
        <RouterLink v-for="review in visible" :key="review.name" :to="'/tasmee/reviews/' + review.name" class="teacher-review-link">
          <span class="teacher-eyebrow">{{ review.is_reviewer ? 'للمراجعة · ' + review.student_name : 'مع ' + review.teacher_name }}</span>
          <strong>سورة {{ getSurahNameArabic(review.surah_number) }} · {{ review.start_ayah }}–{{ review.end_ayah }}</strong>
          <span>{{ reviewLabels[review.status] }}</span>
          <small>{{ new Date(review.created_at).toLocaleDateString('ar') }}</small>
        </RouterLink>
        <BaseButton v-if="data.has_more" variant="secondary" :loading="loading" @click="load(true)">تحميل المزيد</BaseButton>
      </section>
      <section class="teacher-card">
        <h2>المدرّسون والطلاب</h2>
        <p>التسجيلات متاحة للطالب ومدرّسه المرتبط به فقط.</p>
        <form class="grid gap-3" @submit.prevent="action('request_link', { teacher: email })">
          <BaseInput v-model="email" type="email" label="بريد المدرّس" placeholder="teacher@example.com" />
          <BaseButton type="submit" variant="secondary" :disabled="busy || !email.trim()" :loading="busy">طلب الربط بمدرّس</BaseButton>
        </form>
        <article v-for="link in data.links" :key="link.name" class="teacher-review-link">
          <strong>{{ link.is_teacher ? link.student_name : link.teacher_name }}</strong>
          <span>{{ ({ pending: 'بانتظار موافقة المدرّس', active: 'مرتبط', declined: 'لم يُقبل الطلب', revoked: 'الربط مغلق' })[link.status] }}</span>
          <div v-if="link.is_teacher && link.status === 'pending'" class="flex gap-2">
            <BaseButton :disabled="busy" @click="action('respond_link', { name: link.name, action: 'accept' })">قبول</BaseButton>
            <BaseButton variant="secondary" :disabled="busy" @click="action('respond_link', { name: link.name, action: 'decline' })">رفض</BaseButton>
          </div>
          <BaseButton v-if="['active', 'pending'].includes(link.status)" variant="secondary" :disabled="busy" @click="action('respond_link', { name: link.name, action: 'revoke' })">إنهاء الربط وإيقاف وصول المدرّس</BaseButton>
        </article>
      </section>
    </template>
  </main>
</template>
