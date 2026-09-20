<script setup lang="ts">
import { onMounted } from 'vue'

import { useOAuthFlow } from '@/modules/auth/composables'
import { BaseLoading } from '@/shared/components'

const { completeOAuthCallback } = useOAuthFlow()

onMounted(() => {
  void completeOAuthCallback()
})
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
          <h1
            dir="auto"
            class="w-full text-right text-[24px] font-semibold leading-[36px] text-[color:var(--sqc-color-text-primary)]"
          >
            جارٍ الاتصال بحسابك
          </h1>

          <p
            dir="auto"
            class="w-full text-right text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
          >
            ننتظر تأكيد مزود تسجيل الدخول. لا تغلق هذه الشاشة الآن.
          </p>

          <BaseLoading
            label="جارٍ إكمال تسجيل الدخول الآمن"
            class="!w-full"
          />
        </div>
      </div>
    </div>
  </main>
</template>
