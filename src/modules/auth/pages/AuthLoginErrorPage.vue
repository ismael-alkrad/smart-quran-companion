<script setup lang="ts">
import { useLoginFlow } from '@/modules/auth/composables'
import {
  AuthActions,
  AuthCredentialsFields,
  AuthForm,
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
  goToLogin,
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
          @back="goToLogin"
        />

        <h1
          dir="auto"
          class="w-full text-right text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          تعذر تسجيل الدخول
        </h1>

        <BaseBanner
          tone="error"
          title="تحقق من بياناتك"
          body="البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى."
        />

        <BaseBanner
          v-if="requestError"
          tone="error"
          title="تعذر تنفيذ الطلب"
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
            password-error="أعد التحقق من كلمة المرور"
            autofocus-password
          />
        </AuthForm>

        <AuthActions
          primary-label="إعادة المحاولة"
          :primary-loading="loading"
          primary-loading-text="جارٍ تسجيل الدخول"
          @primary="login"
        />
      </div>
    </div>
  </main>
</template>
