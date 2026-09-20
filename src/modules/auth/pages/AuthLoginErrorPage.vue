<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthActions, AuthForm } from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseBanner,
  BaseInput,
} from '@/shared/components'

const route = useRoute()
const router = useRouter()

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const password = ref('')
const passwordInput = ref<InstanceType<typeof BaseInput> | null>(null)

function goToLogin() {
  void router.push('/auth/login')
}

function goToForgotPassword() {
  void router.push('/auth/forgot-password')
}

onMounted(() => {
  passwordInput.value?.focus()
})
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

        <AuthForm
          footer-text="نسيت كلمة المرور؟"
          footer-variant="action"
          @footer="goToForgotPassword"
        >
          <BaseInput
            v-model="email"
            type="email"
            label="البريد الإلكتروني"
            placeholder="name@example.com"
          />

          <BaseInput
            ref="passwordInput"
            v-model="password"
            type="password"
            label="كلمة المرور"
            placeholder="••••••••"
            error="أعد التحقق من كلمة المرور"
          />
        </AuthForm>

        <AuthActions primary-label="إعادة المحاولة" />
      </div>
    </div>
  </main>
</template>
