<script setup lang="ts">
import { useLoginFlow } from '@/modules/auth/composables'
import {
  AuthActions,
  AuthCredentialsFields,
  AuthForm,
  AuthIntro,
  OAuthOptions,
} from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseBanner,
} from '@/shared/components'

const {
  email,
  password,
  requestError,
  loading,
  login,
  goToWelcome,
  goToRegister,
  goToForgotPassword,
} = useLoginFlow()
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
          @back="goToWelcome"
        />

        <AuthIntro
          title="مرحبًا بعودتك"
          description="ادخل إلى حسابك لمتابعة الحفظ والمراجعة من آخر موضع."
        />

        <OAuthOptions />

        <BaseBanner
          v-if="requestError"
          tone="error"
          title="تعذر تسجيل الدخول"
          :body="requestError"
        />

        <AuthForm
          footer-text="نسيت كلمة المرور؟"
          footer-variant="action"
          @footer="goToForgotPassword"
        >
          <AuthCredentialsFields
            v-model:email="email"
            v-model:password="password"
          />
        </AuthForm>

        <AuthActions
          primary-label="دخول"
          secondary-label="ليس لديك حساب؟ إنشاء حساب جديد"
          :primary-loading="loading"
          primary-loading-text="جارٍ تسجيل الدخول"
          @primary="login"
          @secondary="goToRegister"
        />
      </div>
    </div>
  </main>
</template>
