<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  AuthActions,
  AuthForm,
  AuthIntro,
  OAuthOptions,
} from '@/modules/auth/components'
import { BaseAppBar, BaseInput } from '@/shared/components'

const router = useRouter()

const email = ref('')
const password = ref('')

function goBack() {
  void router.push('/auth')
}

function goToLogin() {
  void router.push('/auth/login')
}

function goToVerifyEmail() {
  void router.push('/auth/verify-email')
}
</script>

<template>
  <main
    dir="rtl"
    class="min-h-dvh w-full bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div class="mx-auto min-h-dvh w-full max-w-[390px] px-[16px] py-[24px]">
      <div
        class="flex min-h-[calc(100dvh-48px)] w-full flex-col items-end gap-[20px] overflow-hidden pb-[24px]"
      >
        <BaseAppBar
          type="back"
          title="إنشاء حساب"
          back-label="رجوع"
          @back="goBack"
        />

        <AuthIntro
          title="أنشئ حسابك"
          description="احفظ تقدمك وارجع إلى خطتك من أي جهاز."
        />

        <OAuthOptions />

        <AuthForm
          footer-text="بإنشاء الحساب، يمكنك لاحقًا التحكم في إعدادات الخصوصية والذكاء الاصطناعي من داخل التطبيق."
        >
          <BaseInput
            v-model="email"
            type="email"
            label="البريد الإلكتروني"
            placeholder="name@example.com"
          />

          <BaseInput
            v-model="password"
            type="password"
            label="كلمة المرور"
            placeholder="••••••••"
          />
        </AuthForm>

        <AuthActions
          primary-label="إنشاء الحساب"
          secondary-label="لديك حساب؟ تسجيل الدخول"
          @primary="goToVerifyEmail"
          @secondary="goToLogin"
        />
      </div>
    </div>
  </main>
</template>
