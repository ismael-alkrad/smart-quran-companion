<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  AuthActions,
  AuthForm,
  AuthIntro,
} from '@/modules/auth/components'
import { BaseAppBar, BaseInput } from '@/shared/components'

const router = useRouter()

const email = ref('')

function goToLogin() {
  void router.push('/auth/login')
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
          title="استعادة كلمة المرور"
          back-label="رجوع"
          @back="goToLogin"
        />

        <AuthIntro
          title="نسيت كلمة المرور؟"
          description="أدخل بريدك الإلكتروني وسنرسل لك رمزًا آمنًا لإعادة تعيين كلمة المرور."
        />

        <AuthForm>
          <BaseInput
            v-model="email"
            type="email"
            label="البريد الإلكتروني"
            placeholder="name@example.com"
          />
        </AuthForm>

        <AuthActions
          primary-label="إرسال رمز الاستعادة"
          secondary-label="تذكرت كلمة المرور؟ تسجيل الدخول"
          secondary-size="small"
          @secondary="goToLogin"
        />
      </div>
    </div>
  </main>
</template>
