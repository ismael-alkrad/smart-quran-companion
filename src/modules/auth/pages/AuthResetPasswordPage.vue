<script setup lang="ts">
import { usePasswordResetFlow } from '@/modules/auth/composables'
import {
  AuthActions,
  AuthCodeField,
  AuthForm,
  AuthIntro,
  AuthNewPasswordFields,
} from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseBanner,
} from '@/shared/components'

const {
  passwordResetCode,
  password,
  confirmation,
  requestError,
  codeError,
  passwordError,
  confirmationError,
  resetting,
  resetPassword,
  goToForgotPassword,
} = usePasswordResetFlow()
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
          title="كلمة مرور جديدة"
          back-label="رجوع"
          @back="goToForgotPassword"
        />

        <AuthIntro
          title="أنشئ كلمة مرور جديدة"
          description="استخدم كلمة مرور قوية ومختلفة للحفاظ على حسابك."
        />

        <BaseBanner
          v-if="requestError"
          tone="error"
          title="تعذر تحديث كلمة المرور"
          :body="requestError"
        />

        <AuthForm>
          <AuthCodeField
            v-model="passwordResetCode"
            label="رمز الاستعادة"
            :error="codeError"
          />

          <AuthNewPasswordFields
            v-model:password="password"
            v-model:confirmation="confirmation"
            :password-error="passwordError"
            :confirmation-error="confirmationError"
          />
        </AuthForm>

        <AuthActions
          primary-label="تحديث كلمة المرور"
          :primary-loading="resetting"
          primary-loading-text="جارٍ تحديث كلمة المرور"
          @primary="resetPassword"
        />
      </div>
    </div>
  </main>
</template>
