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

const recoveryCode = ref('')
const password = ref('')
const passwordConfirmation = ref('')

function goBack() {
  void router.push('/auth/forgot-password')
}

function goToResetSuccess() {
  void router.push('/auth/password-reset-success')
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
          title="كلمة مرور جديدة"
          back-label="رجوع"
          @back="goBack"
        />

        <AuthIntro
          title="أنشئ كلمة مرور جديدة"
          description="استخدم كلمة مرور قوية ومختلفة للحفاظ على حسابك."
        />

        <AuthForm>
          <BaseInput
            v-model="recoveryCode"
            label="رمز الاستعادة"
            placeholder="— — — — — —"
          />

          <BaseInput
            v-model="password"
            type="password"
            label="كلمة المرور الجديدة"
            placeholder="••••••••"
          />

          <BaseInput
            v-model="passwordConfirmation"
            type="password"
            label="تأكيد كلمة المرور"
            placeholder="••••••••"
          />
        </AuthForm>

        <AuthActions
          primary-label="تحديث كلمة المرور"
          @primary="goToResetSuccess"
        />
      </div>
    </div>
  </main>
</template>
