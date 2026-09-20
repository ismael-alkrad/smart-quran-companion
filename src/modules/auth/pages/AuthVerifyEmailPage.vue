<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  AuthActions,
  AuthForm,
  AuthIntro,
} from '@/modules/auth/components'
import { BaseAppBar, BaseInput } from '@/shared/components'

const router = useRouter()

const code = ref('')
const codeInput = ref<InstanceType<typeof BaseInput> | null>(null)

function goBack() {
  void router.push('/auth/register')
}

function goToAccountReady() {
  void router.push('/auth/account-ready')
}

onMounted(() => {
  codeInput.value?.focus()
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
          title="تأكيد البريد"
          back-label="رجوع"
          @back="goBack"
        />

        <AuthIntro
          title="تحقق من بريدك الإلكتروني"
          description="أرسلنا رمز تحقق إلى بريدك. أدخل الرمز لإكمال إنشاء الحساب."
        />

        <AuthForm>
          <BaseInput
            ref="codeInput"
            v-model="code"
            label="رمز التحقق"
            helper="الرمز مكوّن من 6 أرقام"
            placeholder="— — — — — —"
          />
        </AuthForm>

        <AuthActions
          primary-label="تأكيد البريد"
          secondary-label="لم يصلك الرمز؟ إعادة الإرسال"
          secondary-size="small"
          @primary="goToAccountReady"
        />
      </div>
    </div>
  </main>
</template>
