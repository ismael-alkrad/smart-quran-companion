<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthSession } from '@/modules/auth/composables'
import { resolvePostAuthDestination } from '@/modules/auth/navigation'
import { BaseLoading } from '@/shared/components'

const route = useRoute()
const router = useRouter()
const { refreshSession } = useAuthSession()

onMounted(async () => {
  const session = await refreshSession()

  if (!session) {
    return
  }

  if (session.authenticated) {
    void router.replace(
      resolvePostAuthDestination(route.query.redirect),
    )
    return
  }

  void router.replace('/auth')
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
          <p
            class="text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-brand)]"
          >
            SMART QURAN COMPANION
          </p>

          <h1
            dir="auto"
            class="w-full text-right text-[24px] font-semibold leading-[36px] text-[color:var(--sqc-color-text-primary)]"
          >
            القرآن معك من حيث توقفت
          </h1>

          <div class="flex h-[112px] w-full items-center justify-center">
            <BaseLoading label="جارٍ التحقق من الجلسة" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
