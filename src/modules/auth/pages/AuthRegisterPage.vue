<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthMutation } from '@/modules/auth/api'
import {
  AuthActions,
  AuthCredentialsFields,
  AuthForm,
  AuthIntro,
  OAuthOptions,
} from '@/modules/auth/components'
import { useAuthFlowStore } from '@/modules/auth/stores'
import {
  BaseAppBar,
  BaseBanner,
} from '@/shared/components'

const router = useRouter()
const authFlow = useAuthFlowStore()
const registerCall = useAuthMutation('register')

const email = computed({
  get: () => authFlow.email,
  set: (value: string) => authFlow.setEmail(value),
})
const password = ref('')
const requestError = ref<string>()

function goBack() {
  void router.push('/auth')
}

function goToLogin() {
  void router.push('/auth/login')
}

async function register() {
  requestError.value = undefined

  const response = await registerCall.submit({
    email: email.value,
    password: password.value,
  })

  if (response?.ok && response.status === 'verification_required') {
    authFlow.setEmail(response.email)
    authFlow.clearVerificationCode()
    void router.push('/auth/verify-email')
    return
  }

  if (response?.status === 'email_already_used') {
    authFlow.setEmail(response.email)
    void router.push({
      path: '/auth/email-already-used',
      query: { email: response.email },
    })
    return
  }

  requestError.value = 'تعذر إنشاء الحساب الآن. تحقق من البيانات وحاول مرة أخرى.'
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

        <BaseBanner
          v-if="requestError"
          tone="error"
          title="تعذر إنشاء الحساب"
          :body="requestError"
        />

        <AuthForm
          footer-text="بإنشاء الحساب، يمكنك لاحقًا التحكم في إعدادات الخصوصية والذكاء الاصطناعي من داخل التطبيق."
        >
          <AuthCredentialsFields
            v-model:email="email"
            v-model:password="password"
          />
        </AuthForm>

        <AuthActions
          primary-label="إنشاء الحساب"
          secondary-label="لديك حساب؟ تسجيل الدخول"
          :primary-loading="registerCall.loading"
          primary-loading-text="جارٍ إنشاء الحساب"
          @primary="register"
          @secondary="goToLogin"
        />
      </div>
    </div>
  </main>
</template>
