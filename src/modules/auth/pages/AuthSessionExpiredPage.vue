<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { buildLoginLocation } from '@/modules/auth/navigation'
import { useAuthSessionStore } from '@/modules/auth/stores'
import {
  BaseBanner,
  BaseButton,
} from '@/shared/components'

const route = useRoute()
const router = useRouter()
const sessionStore = useAuthSessionStore()

sessionStore.clear()

function goToLogin() {
  void router.push(
    buildLoginLocation(route.query.redirect),
  )
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
          <h1
            dir="auto"
            class="w-full text-right text-[24px] font-semibold leading-[36px] text-[color:var(--sqc-color-text-primary)]"
          >
            انتهت جلستك
          </h1>

          <BaseBanner
            tone="warning"
            title="سجّل الدخول من جديد"
            body="لحماية حسابك، انتهت الجلسة الحالية. تقدمك المحفوظ لن يتأثر."
          />

          <BaseButton
            size="large"
            variant="primary"
            class="w-full"
            @click="goToLogin"
          >
            تسجيل الدخول
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>
