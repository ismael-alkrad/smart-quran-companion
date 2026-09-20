<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import { useOAuthFlow } from '@/modules/auth/composables'
import {
  buildLoginLocation,
  getOAuthProvider,
} from '@/modules/auth/navigation'
import { useAuthFlowStore } from '@/modules/auth/stores'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
} from '@/shared/components'

const route = useRoute()
const router = useRouter()
const authFlow = useAuthFlowStore()
const { starting, beginOAuth } = useOAuthFlow()

const provider = getOAuthProvider(route.query.provider)
function goBack() {
  authFlow.clearOAuthState()
  void router.push('/auth')
}

function retry() {
  if (!provider) {
    void router.push('/auth')
    return
  }

  void beginOAuth(provider)
}

function useEmail() {
  authFlow.clearOAuthState()
  void router.push(buildLoginLocation(authFlow.postAuthRedirect))
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
          title="تسجيل الدخول الخارجي"
          back-label="رجوع"
          @back="goBack"
        />

        <h1
          dir="auto"
          class="w-full text-right text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          تعذر إكمال تسجيل الدخول
        </h1>

        <BaseBanner
          tone="warning"
          title="لم يكتمل الاتصال"
          body="قد يكون تسجيل الدخول أُلغي أو حدث خطأ مؤقت لدى مزود الحساب. لم يتم إنشاء جلسة."
        />

        <div class="flex w-full flex-col items-end gap-[12px] overflow-hidden">
          <BaseButton
            size="large"
            variant="primary"
            class="w-full"
            :loading="starting"
            loading-text="جارٍ إعادة المحاولة"
            @click="retry"
          >
            إعادة المحاولة
          </BaseButton>

          <BaseButton
            size="large"
            variant="secondary"
            class="w-full"
            :disabled="starting"
            @click="useEmail"
          >
            استخدام البريد الإلكتروني
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>
