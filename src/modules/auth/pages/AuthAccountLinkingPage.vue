<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { AuthIntro } from '@/modules/auth/components'
import {
  buildLoginLocation,
  buildOAuthErrorLocation,
} from '@/modules/auth/navigation'
import { useAuthFlowStore } from '@/modules/auth/stores'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
} from '@/shared/components'

const router = useRouter()
const authFlow = useAuthFlowStore()

onMounted(() => {
  if (
    !authFlow.oauthProvider
    || !authFlow.oauthLinkEmail
    || !authFlow.oauthLinkToken
  ) {
    void router.replace(
      buildOAuthErrorLocation(
        authFlow.oauthProvider || undefined,
        'invalid_state',
      ),
    )
  }
})

function clearLinkingIdentity() {
  authFlow.clearOAuthState()
  authFlow.setEmail('')
}

function goBack() {
  clearLinkingIdentity()
  void router.push('/auth')
}

function loginAndLink() {
  authFlow.setEmail(authFlow.oauthLinkEmail)
  void router.push(
    buildLoginLocation(authFlow.postAuthRedirect),
  )
}

function useDifferentAccount() {
  clearLinkingIdentity()
  void router.push('/auth')
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
          title="ربط الحساب"
          back-label="رجوع"
          @back="goBack"
        />

        <AuthIntro
          title="يوجد حساب بهذا البريد"
          description="بعد الربط، يمكنك استخدام البريد وكلمة المرور أو Google/Apple للدخول إلى نفس الحساب."
        />

        <BaseBanner
          tone="info"
          title="لن نربط الحساب تلقائيًا"
          body="لحماية حسابك، سجّل الدخول بالطريقة الحالية أولًا ثم نربط مزود OAuth بعد التحقق."
        />

        <div class="flex w-full flex-col items-end gap-[12px] overflow-hidden">
          <BaseButton
            size="large"
            variant="primary"
            class="w-full"
            @click="loginAndLink"
          >
            تسجيل الدخول وربط الحساب
          </BaseButton>

          <BaseButton
            size="large"
            variant="secondary"
            class="w-full"
            @click="useDifferentAccount"
          >
            استخدام حساب مختلف
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>
