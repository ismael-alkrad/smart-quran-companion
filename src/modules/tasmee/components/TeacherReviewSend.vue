<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getTeacherDashboard, getTeacherReview, teacherAction, type TeacherLink, type TeacherReview } from '../api/teacherReview'
import { BaseBanner, BaseButton, BaseLoading } from '@/shared/components'

const props = defineProps<{ sessionName: string; parentReview?: string }>()
const router = useRouter()
const links = ref<TeacherLink[]>([])
const selected = ref('')
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const existing = ref<TeacherReview | null>(null)
const retryLink = ref('')
const active = computed(() => links.value.filter(l => !l.is_teacher && l.status === 'active' &&
  (!props.parentReview || l.name === retryLink.value)))
async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await getTeacherDashboard()
    links.value = data.links
    if (props.parentReview) retryLink.value = (await getTeacherReview(props.parentReview)).relationship
    selected.value = active.value[0]?.name ?? ''
    // Submission itself is idempotent even when this review is on an older page.
    existing.value = data.reviews.find(r => r.session === props.sessionName) ?? null
  } catch { error.value = 'تعذر تحميل المدرّسين. أعد المحاولة.' }
  finally { loading.value = false }
}
async function send() {
  busy.value = true
  error.value = ''
  try {
    const review = await teacherAction<TeacherReview>('submit', {
      session_name: props.sessionName, relationship: selected.value,
      ...(props.parentReview ? { parent_review: props.parentReview } : {}),
    })
    await router.push('/tasmee/reviews/' + review.name)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'تعذر الإرسال. أعد المحاولة.'
  } finally { busy.value = false }
}
onMounted(load)
</script>

<template>
  <section class="flex flex-col gap-4 rounded-xl bg-[var(--sqc-color-background-elevated)] p-4">
    <h2 class="text-base font-semibold">إرسال للمدرّس</h2>
    <p class="text-sm leading-6 text-[var(--sqc-color-text-secondary)]">يسمع المدرّس تسجيلك بوقته ويترك لك ملاحظات عند مواضعها.</p>
    <BaseLoading v-if="loading" label="جارٍ تحميل المدرّسين" />
    <template v-else-if="existing">
      <BaseButton @click="router.push('/tasmee/reviews/' + existing.name)">عرض التسميع المرسل</BaseButton>
    </template>
    <template v-else-if="active.length">
      <label for="review-teacher" class="text-sm">المدرّس</label>
      <select id="review-teacher" v-model="selected" class="rounded-xl border bg-transparent p-3">
        <option v-for="link in active" :key="link.name" :value="link.name">{{ link.teacher_name }}</option>
      </select>
      <BaseButton :loading="busy" :disabled="busy || !selected" @click="send">إرسال للمراجعة</BaseButton>
    </template>
    <template v-else>
      <p class="text-sm">اربط حسابك بمدرّس، وبعد قبوله الطلب تقدر ترسل هذا التسجيل.</p>
      <BaseButton variant="secondary" @click="router.push('/tasmee')">ربط حسابي بمدرّس</BaseButton>
    </template>
    <BaseBanner v-if="error" tone="error" title="تعذر إكمال الطلب" :body="error" />
    <BaseButton v-if="error && !active.length" variant="secondary" @click="load">إعادة المحاولة</BaseButton>
  </section>
</template>
