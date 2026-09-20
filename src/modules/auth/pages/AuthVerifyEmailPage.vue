<script setup lang="ts">
import { useRouter } from 'vue-router'
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
} from '@/shared/components'

const router = useRouter()
const {
  verificationCode,
  requestError,
  verifying,
  resending,
  verifyEmail,
  resendVerificationCode,
} = useEmailVerificationFlow()

function goBack() {
  void router.push('/auth/register')
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
          title="تأكيد البريد"
          back-label="رجوع"
          @back="goBack"
        />

        <AuthIntro
          title="تحقق من بريدك الإلكتروني"
          description="أرسلنا رمز تحقق إلى بريدك. أدخل الرمز لإكمال إنشاء الحساب."
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
            helper="الرمز مكوّن من 6 أرقام"
          />
        </AuthForm>

        <AuthActions
          primary-label="تأكيد البريد"
          secondary-label="لم يصلك الرمز؟ إعادة الإرسال"
          secondary-size="small"
          :primary-loading="verifying"
          primary-loading-text="جارٍ التحقق"
          @primary="verifyEmail"
          @secondary="resendVerificationCode"
        />

        <p
          v-if="resending"
          dir="auto"
          class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-tertiary)]"
        >
          جارٍ إرسال رمز جديد…
        </p>
      </div>
    </div>
  </main>
</template>
