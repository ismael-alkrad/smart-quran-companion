<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BaseButton } from '@/shared/components'

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
        class="flex min-h-[calc(100dvh-48px)] w-full flex-col items-end overflow-hidden pb-[24px] pt-[168px]"
      >
        <div class="flex w-full flex-col items-end gap-[16px] overflow-hidden">
          <p
            dir="auto"
            class="text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-status-success)]"
          >
            تم تحديث كلمة المرور
          </p>

          <h1
            dir="auto"
            class="w-full text-right text-[24px] font-semibold leading-[36px] text-[color:var(--sqc-color-text-primary)]"
          >
            كلمة المرور الجديدة جاهزة
          </h1>

          <p
            dir="auto"
            class="w-full text-right text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
          >
            يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
          </p>

          <BaseButton
            size="large"
            variant="primary"
            class="w-full"
            @click="goToLogin"
          >
            العودة لتسجيل الدخول
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>
