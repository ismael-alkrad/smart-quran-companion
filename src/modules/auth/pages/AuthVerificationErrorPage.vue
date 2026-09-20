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

const code = ref(typeof route.query.code === 'string' ? route.query.code : '')
const codeInput = ref<InstanceType<typeof BaseInput> | null>(null)

function goBack() {
  void router.push('/auth/verify-email')
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

        <h1
          dir="auto"
          class="w-full text-right text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
        >
          الرمز غير صالح أو انتهت صلاحيته
        </h1>

        <BaseBanner
          tone="warning"
          title="تعذر التحقق"
          body="أدخل الرمز الأخير الذي وصلك، أو اطلب رمزًا جديدًا."
        />

        <AuthForm>
          <BaseInput
            ref="codeInput"
            v-model="code"
            label="رمز التحقق"
            placeholder="— — — — — —"
            error="الرمز غير صحيح أو منتهي"
          />
        </AuthForm>

        <div class="flex w-full flex-col items-end gap-[12px]">
          <BaseButton
            size="large"
            variant="primary"
            class="w-full"
          >
            تأكيد الرمز
          </BaseButton>

          <BaseButton
            size="large"
            variant="secondary"
            class="w-full"
          >
            إرسال رمز جديد
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>
