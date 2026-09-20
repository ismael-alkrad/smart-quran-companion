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
          title="تسجيل الدخول"
          back-label="رجوع"
          @back="goBack"
        />

        <AuthIntro
          title="مرحبًا بعودتك"
          description="ادخل إلى حسابك لمتابعة الحفظ والمراجعة من آخر موضع."
        />

        <OAuthOptions />

        <AuthForm
          footer-text="نسيت كلمة المرور؟"
          footer-variant="action"
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
          primary-label="دخول"
          secondary-label="ليس لديك حساب؟ إنشاء حساب جديد"
        />
      </div>
    </div>
  </main>
</template>
