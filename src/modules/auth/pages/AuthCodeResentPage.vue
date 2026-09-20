<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  AuthActions,
  AuthForm,
  AuthIntro,
} from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseInput,
  BaseToast,
} from '@/shared/components'

const router = useRouter()

const code = ref('')
const codeInput = ref<InstanceType<typeof BaseInput> | null>(null)
const showToast = ref(true)

function goBack() {
  void router.push('/auth/verify-email')
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
          title="أرسلنا رمزًا جديدًا"
          description="استخدم أحدث رمز وصل إليك. الرموز السابقة لن تعمل بعد الآن."
        />

        <BaseToast
          v-if="showToast"
          tone="success"
          message="تم إرسال رمز تحقق جديد إلى بريدك"
          class="!w-full"
          @close="showToast = false"
        />

        <AuthForm>
          <BaseInput
            ref="codeInput"
            v-model="code"
            label="رمز التحقق"
            helper="أدخل الرمز الجديد المكوّن من 6 أرقام"
            placeholder="— — — — — —"
          />
        </AuthForm>

        <AuthActions
          primary-label="تأكيد البريد"
          @primary="goToAccountReady"
        />
      </div>
    </div>
  </main>
</template>
