<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthSession } from '@/modules/auth/composables/useAuthSession'
import { useHifzOverview } from '@/modules/quran/composables/useHifzOverview'
import QuranProgressCard from '@/modules/quran/components/QuranProgressCard.vue'
import { toArabicNumber } from '@/modules/quran/utils/number'
import { useThemeStore, type ThemePreference } from '@/shared/theme/theme.store'
import { BaseAppBar, BaseAvatar, BaseBanner, BaseBottomNav, BaseButton, BaseLoading, BaseUserRow } from '@/shared/components'

const router = useRouter()
const { sessionStore, logout } = useAuthSession()
const theme = useThemeStore()
const { surahs, overallProgress, hasNeedsReview, loading, failed, refresh } = useHifzOverview()
const leaving = ref(false)
const logoutFailed = ref(false)
const displayName = computed(() => [sessionStore.user?.first_name, sessionStore.user?.last_name].filter(Boolean).join(' ') || 'حسابي')
const completed = computed(() => surahs.value.reduce((total, s) => total + s.completedAyahs, 0))
function changeTheme(event: Event) {
  theme.setPreference((event.target as HTMLSelectElement).value as ThemePreference)
}
async function signOut() {
  if (leaving.value) return
  leaving.value = true
  logoutFailed.value = false
  try {
    const result = await logout()
    if (!result?.ok) throw new Error()
    await router.replace('/auth/login')
  } catch { logoutFailed.value = true }
  finally { leaving.value = false }
}
onMounted(refresh)
</script>

<template>
  <main dir="rtl" class="min-h-dvh bg-[var(--sqc-color-background-primary)] px-4 pb-[100px] pt-6 text-[var(--sqc-color-text-primary)] [font-family:var(--sqc-font-family-ui)]">
    <div class="mx-auto flex max-w-[720px] flex-col gap-4">
      <BaseAppBar title="الملف الشخصي" class="!w-full" />
      <div class="flex min-h-[88px] items-center justify-between gap-4">
        <div class="min-w-0">
          <h1 class="break-words text-2xl font-semibold leading-9">{{ displayName }}</h1>
          <p dir="ltr" class="break-all text-right text-sm leading-6 text-[var(--sqc-color-text-secondary)]">{{ sessionStore.user?.email || sessionStore.user?.name }}</p>
        </div>
        <BaseAvatar type="placeholder" size="large" aria-label="صورة الحساب" />
      </div>
      <BaseLoading v-if="loading" label="جارٍ تحميل التقدم" />
      <template v-else-if="failed">
        <BaseBanner tone="error" title="تعذر تحميل التقدم" body="يمكنك متابعة استخدام إعدادات حسابك أو إعادة المحاولة." />
        <BaseButton variant="secondary" @click="refresh">إعادة المحاولة</BaseButton>
      </template>
      <QuranProgressCard v-else title="تقدمك القرآني" :meta="`${toArabicNumber(completed)} آية معتمدة في سجل الحفظ`" :value="overallProgress" :state="hasNeedsReview ? 'needs-review' : 'on-track'" class="!w-full" />
      <h2 class="text-lg font-medium leading-7">الحساب والإعدادات</h2>
      <BaseUserRow name="الحفظ والمراجعة" meta="تفاصيل تقدمك حسب السور" initials="ح" class="!w-full" @click="router.push('/quran')" />
      <BaseUserRow name="شركاء التسميع" meta="تعلّم وراجع لغيرك من نفس الحساب" initials="ت" class="!w-full" @click="router.push('/tasmee')" />
      <section class="flex flex-col gap-3 rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-elevated)] p-5">
        <label for="profile-theme" class="font-semibold">مظهر التطبيق</label>
        <select id="profile-theme" :value="theme.preference" class="min-h-12 rounded-xl border border-[var(--sqc-color-border-default)] bg-[var(--sqc-color-background-primary)] px-3" @change="changeTheme">
          <option value="system">حسب الجهاز</option><option value="light">فاتح</option><option value="dark">داكن</option>
        </select>
        <p class="text-xs leading-5 text-[var(--sqc-color-text-secondary)]">يُحفظ اختيارك على هذا الجهاز.</p>
      </section>
      <section class="flex flex-col gap-2 rounded-[var(--sqc-dimension-radius-12)] bg-[var(--sqc-color-background-elevated)] p-5">
        <h2 class="font-semibold">دورك وخصوصية تسجيلاتك</h2>
        <p class="text-sm leading-6 text-[var(--sqc-color-text-secondary)]">يمكنك التسميع، أو مراجعة تسجيلات غيرك، أو القيام بالدورين. كل تسجيل يحدد صاحبه ومن يراجعه. لا يصل الشريك إلى تسجيلك إلا بعد أن ترسله إليه، ويمكن إنهاء الربط من صفحة التسميع.</p>
        <p class="text-xs leading-5 text-[var(--sqc-color-text-secondary)]">إنهاء الربط يمنع الوصول اللاحق، ولا يحذف نسخة سبق تنزيلها. اعتماد الشريك يخص التسجيل ولا يغيّر سجل الحفظ تلقائيًا.</p>
      </section>
      <BaseBanner v-if="logoutFailed" tone="error" title="تعذر تسجيل الخروج" body="تحقق من الاتصال وأعد المحاولة." />
      <BaseButton variant="secondary" size="large" :loading="leaving" :disabled="leaving" @click="signOut">تسجيل الخروج</BaseButton>
    </div>
    <div class="fixed inset-x-0 bottom-0 z-50"><BaseBottomNav model-value="profile" class="!static" /></div>
  </main>
</template>
