<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthForm } from '@/modules/auth/components'
import {
  BaseAppBar,
  BaseBanner,
  BaseButton,
  BaseInput,
} from '@/shared/components'

const route = useRoute()
const router = useRouter()

const email = ref(typeof route.query.email === 'string' ? route.query.email : '')
const emailInput = ref<InstanceType<typeof BaseInput> | null>(null)

function goBack() {
  void router.push('/auth/register')
}

function goToLogin() {
  void router.push({
    path: '/auth/login',
    query: email.value ? { email: email.value } : undefined,
  })
}

function useDifferentEmail() {
  void router.push('/auth/register')
}

onMounted(() => {
  emailInput.value?.focus()
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
          title="إنشاء حساب"
          back-label="رجوع"
          @back="goBack"
        />

        <h1
          dir="auto"
          class="w-full text-right text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          هذا البريد مستخدم بالفعل
        </h1>

        <BaseBanner
          tone="warning"
          title="لديك حساب سابق"
          body="سجل الدخول بهذا البريد أو استخدم بريدًا مختلفًا لإنشاء حساب جديد."
        />

        <AuthForm>
          <BaseInput
            ref="emailInput"
            v-model="email"
            type="email"
            label="البريد الإلكتروني"
            placeholder="name@example.com"
            error="هذا البريد مرتبط بحساب موجود"
          />
        </AuthForm>

        <div class="flex w-full flex-col items-end gap-[12px]">
          <BaseButton
            size="large"
            variant="primary"
            class="w-full"
            @click="goToLogin"
          >
            تسجيل الدخول
          </BaseButton>

          <BaseButton
            size="large"
            variant="secondary"
            class="w-full"
            @click="useDifferentEmail"
          >
            استخدام بريد مختلف
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>
