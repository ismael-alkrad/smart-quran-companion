<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSurahNameArabic } from '@/modules/quran/data/surahNames'
import { BaseAppBar, BaseBanner, BaseBottomNav, BaseButton, BaseInput, BaseLoading, BaseSegmentedControl } from '@/shared/components'
import { getTeacherDashboard, teacherAction, reviewLabels, type TeacherDashboard } from '../api/teacherReview'
import '../teacher-review.css'

const router = useRouter()
const data = ref<TeacherDashboard | null>(null)
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const email = ref('')
const filter = ref('all')
const scope = ref('mine')
const mode = ref('mutual')
const offset = ref(0)
let loadVersion = 0
async function load(more = false) {
  const version = ++loadVersion
  loading.value = true
  error.value = ''
  try {
    const nextOffset = more ? offset.value + 20 : 0
    const next = await getTeacherDashboard(nextOffset, scope.value, filter.value)
    if (version !== loadVersion) return
    if (more && data.value) next.reviews = [...data.value.reviews, ...next.reviews]
    data.value = next
    offset.value = nextOffset
  } catch { if (version === loadVersion) error.value = 'تعذر تحميل التسميعات. تحقق من الاتصال وأعد المحاولة.' }
  finally { if (version === loadVersion) loading.value = false }
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
watch([scope, filter], () => load(), { immediate: true })
</script>

<template>
  <main dir="rtl" class="teacher-page !pb-[100px]">
    <BaseAppBar type="back" title="التسميع والمتابعة" @back="router.push('/home')" />
    <section class="teacher-card">
      <span class="teacher-eyebrow">تعلّم وراجع لغيرك، من نفس الحساب</span>
      <h1>كل تسميع خطوة نحو الإتقان</h1>
      <p>سمّع لمدرّسك أو صاحبك، واسمع له عندما يأتي دوره. لكل تسجيل قارئ ومراجع، ويمكنك القيام بالدورين.</p>
      <BaseButton size="large" @click="router.push('/tasmee/select')">اختيار مقطع وتسجيله</BaseButton>
      <BaseButton variant="secondary" @click="router.push('/quran/hifz/daily-plan')">تسجيل مقرر اليوم</BaseButton>
    </section>
    <BaseBanner v-if="error" tone="error" title="تعذر إكمال الطلب" :body="error" />
    <BaseButton v-if="error" variant="secondary" @click="load()">إعادة المحاولة</BaseButton>
    <BaseLoading v-if="loading && !data" label="جارٍ تحميل التسميعات" />
    <template v-if="data">
      <section class="teacher-card">
        <h2>التسجيلات</h2>
        <BaseSegmentedControl v-model="scope" class="!w-full" :options="[{ value: 'mine', label: 'تسميعاتي' }, { value: 'reviewing', label: 'أراجع لغيري' }]" />
        <label for="review-filter" class="sr-only">تصفية التسميعات</label>
        <select id="review-filter" v-model="filter" class="teacher-field">
          <option value="all">كل الحالات</option>
          <option value="waiting">بانتظار المراجعة</option>
          <option value="changes_requested">تحتاج إعادة</option>
          <option value="approved">معتمدة</option>
        </select>
        <BaseLoading v-if="loading" label="جارٍ تحديث القائمة" />
        <p v-else-if="!data.reviews.length">{{ scope === 'mine' ? 'لا توجد تسجيلات بهذه الحالة. بعد إرسال تسجيلك سيظهر هنا.' : 'لا توجد تسجيلات بهذه الحالة لتراجعها. ستظهر هنا التسجيلات التي يرسلها شركاؤك إليك.' }}</p>
        <RouterLink v-for="review in loading ? [] : data.reviews" :key="review.name" :to="'/tasmee/reviews/' + review.name" class="teacher-review-link">
          <span class="teacher-eyebrow">{{ review.is_reviewer ? 'للمراجعة · ' + review.student_name : 'مع ' + review.teacher_name }}</span>
          <strong>سورة {{ getSurahNameArabic(review.surah_number) }} · {{ review.start_ayah }}–{{ review.end_ayah }}</strong>
          <span>{{ reviewLabels[review.status] }}</span>
          <small>{{ new Date(review.created_at).toLocaleDateString('ar') }}</small>
        </RouterLink>
        <BaseButton v-if="data.has_more" variant="secondary" :disabled="loading" :loading="loading" @click="load(true)">تحميل المزيد</BaseButton>
        <BaseButton variant="secondary" :disabled="loading" @click="load()">تحديث القائمة</BaseButton>
      </section>
      <section class="teacher-card">
        <h2>شركاء التسميع</h2>
        <p>يمكن أن يكون شريكك مدرّسًا أو صاحبًا لديه حساب. الربط يحتاج موافقته، ولا يشارَك أي تسجيل إلا عندما ترسله.</p>
        <form class="grid gap-3" @submit.prevent="action('request_link', { teacher: email, mode })">
          <BaseInput v-model="email" type="email" label="بريد المدرّس أو الصاحب" placeholder="friend@example.com" />
          <label for="link-mode">كيف تريدان التسميع؟</label>
          <select id="link-mode" v-model="mode" class="teacher-field">
            <option value="mutual">نسمّع لبعض — كل واحد يراجع للآخر</option>
            <option value="one_way">أسمّع له فقط — يراجع تسجيلاتي</option>
          </select>
          <BaseButton type="submit" variant="secondary" :disabled="busy || !email.trim()" :loading="busy">إرسال طلب الربط</BaseButton>
        </form>
        <article v-for="link in data.links" :key="link.name" class="teacher-review-link">
          <strong>{{ link.partner_name }}</strong>
          <span>{{ link.is_mutual ? 'نسمّع لبعض' : link.is_teacher ? 'يرسل لي تسميعه لأراجعه' : 'أرسل له تسميعي ليراجعه' }}</span>
          <span>{{ ({ pending: link.can_respond ? 'طلب وارد ينتظر موافقتك' : 'بانتظار موافقة الطرف الآخر', active: 'مرتبط', declined: 'لم يُقبل الطلب', revoked: 'الربط مغلق' })[link.status] }}</span>
          <p v-if="link.can_respond">{{ link.is_mutual ? 'بقبولك يمكن لكل منكما إرسال تسجيلاته للآخر ومراجعتها.' : 'بقبولك يمكنك مراجعة التسجيلات التي يرسلها إليك، ولا يستطيع مراجعة تسجيلاتك بهذا الربط.' }}</p>
          <div v-if="link.can_respond" class="flex gap-2">
            <BaseButton :disabled="busy" @click="action('respond_link', { name: link.name, action: 'accept' })">قبول</BaseButton>
            <BaseButton variant="secondary" :disabled="busy" @click="action('respond_link', { name: link.name, action: 'decline' })">رفض</BaseButton>
          </div>
          <BaseButton v-if="['active', 'pending'].includes(link.status)" variant="secondary" :disabled="busy" @click="action('respond_link', { name: link.name, action: 'revoke' })">إنهاء الربط وإيقاف الوصول</BaseButton>
        </article>
      </section>
    </template>
    <div class="fixed inset-x-0 bottom-0 z-50"><BaseBottomNav model-value="tasmee" class="!static" /></div>
  </main>
</template>
