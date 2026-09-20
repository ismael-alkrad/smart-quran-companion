<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  AuthActions,
  AuthIntro,
  OAuthOptions,
} from '@/modules/auth/components'

const router = useRouter()

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
        class="flex min-h-[calc(100dvh-48px)] w-full flex-col items-end gap-[24px] overflow-hidden pb-[24px] pt-[48px]"
      >
        <AuthIntro
          variant="hero"
          eyebrow="SMART QURAN COMPANION"
          title="ابدأ رحلتك مع القرآن"
          description="حفظ ومراجعة وتسميع ذكي في تجربة هادئة تحافظ على تركيزك."
        />

        <OAuthOptions />

        <AuthActions
          variant="welcome"
          primary-label="تسجيل الدخول بالبريد الإلكتروني"
          secondary-label="ليس لديك حساب؟ إنشاء حساب جديد"
          @primary="goToLogin"
        />

        <p
          dir="auto"
          class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-tertiary)]"
        >
          بالمتابعة، أنت تتحكم في إعدادات الذكاء الاصطناعي والخصوصية من حسابك.
        </p>
      </div>
    </div>
  </main>
</template>
