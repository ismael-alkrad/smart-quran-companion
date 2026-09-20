<script setup lang="ts">
import { useEmailVerificationFlow } from '@/modules/auth/composables'
import {
  AuthForm,
  AuthCodeField,
} from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
} from '@/shared/components'

const {
  verificationCode,
  requestError,
  verifying,
  resending,
  verifyEmail,
  resendVerificationCode,
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

        <h1
          dir="auto"
          class="w-full text-right text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          الرمز غير صالح أو انتهت صلاحيته
        </h1>

        <BaseBanner
          tone="warning"
          title="تعذر التحقق"
          body="أدخل الرمز الأخير الذي وصلك، أو اطلب رمزًا جديدًا."
        />

        <BaseBanner
          v-if="requestError"
          tone="error"
          title="تعذر تنفيذ الطلب"
          :body="requestError"
        />

        <AuthForm>
          <AuthCodeField
            v-model="verificationCode"
            error="الرمز غير صحيح أو منتهي"
          />
        </AuthForm>

        <div class="flex w-full flex-col items-end gap-[12px]">
          <BaseButton
            size="large"
            variant="primary"
            class="w-full"
            :loading="verifying"
            loading-text="جارٍ التحقق"
            @click="verifyEmail"
          >
            تأكيد الرمز
          </BaseButton>

          <BaseButton
            size="large"
            variant="secondary"
            class="w-full"
            :loading="resending"
            loading-text="جارٍ الإرسال"
            @click="resendVerificationCode"
          >
            إرسال رمز جديد
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>
