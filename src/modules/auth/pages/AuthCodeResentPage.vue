<script setup lang="ts">
import { ref } from 'vue'
import { useEmailVerificationFlow } from '@/modules/auth/composables'
import {
  AuthActions,
  AuthForm,
  AuthIntro,
  AuthVerificationCodeField,
} from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseBanner,
  BaseToast,
} from '@/shared/components'

const showToast = ref(true)

const {
  verificationCode,
  requestError,
  verifying,
  verifyEmail,
  returnToVerifyEmail,
} = useEmailVerificationFlow()
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
          title="تأكيد البريد"
          back-label="رجوع"
          @back="returnToVerifyEmail"
        />

        <AuthIntro
          title="أرسلنا رمزًا جديدًا"
          description="استخدم أحدث رمز وصل إليك. الرموز السابقة لن تعمل بعد الآن."
        />

        <BaseToast
          v-if="showToast"
          tone="success"
          message="تم إرسال رمز تحقق جديد إلى بريدك"
          class="!w-full"
          @close="showToast = false"
        />

        <BaseBanner
          v-if="requestError"
          tone="error"
          title="تعذر إكمال التحقق"
          :body="requestError"
        />

        <AuthForm>
          <AuthVerificationCodeField
            v-model="verificationCode"
            helper="أدخل الرمز الجديد المكوّن من 6 أرقام"
          />
        </AuthForm>

        <AuthActions
          primary-label="تأكيد البريد"
          :primary-loading="verifying"
          primary-loading-text="جارٍ التحقق"
          @primary="verifyEmail"
        />
      </div>
    </div>
  </main>
</template>
