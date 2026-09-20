<script setup lang="ts">
import {
  BaseAvatar,
  BaseBottomNav,
  type BaseBottomNavRoutes,
} from '@/shared/components'

withDefaults(
  defineProps<{
    subtitle: string
  }>(),
  {
    subtitle: '',
  },
)

const navRoutes: BaseBottomNavRoutes = {
  home: '/home',
  quran: '/quran/31',
}
</script>

<template>
  <main
    dir="rtl"
    class="min-h-dvh w-full bg-[var(--sqc-color-background-primary)] [font-family:var(--sqc-font-family-ui)]"
  >
    <div
      class="mx-auto min-h-dvh w-full max-w-[1200px] px-[16px] pb-[100px] pt-[24px] sm:px-[24px] lg:px-0 lg:pb-[32px]"
    >
      <div class="hidden lg:block">
        <BaseBottomNav
          model-value="home"
          :routes="navRoutes"
        />
      </div>

      <header
        dir="ltr"
        class="flex h-[64px] w-full items-center justify-between overflow-hidden lg:mt-[24px]"
      >
        <BaseAvatar
          type="placeholder"
          size="medium"
          aria-label="صورة الحساب"
        />

        <div
          dir="rtl"
          class="flex shrink-0 flex-col items-end gap-[2px] overflow-hidden text-right"
        >
          <h1
            dir="rtl"
            class="whitespace-nowrap text-[24px] font-semibold leading-[36px] text-[color:var(--sqc-color-text-primary)]"
          >
            السلام عليكم
          </h1>

          <p
            dir="rtl"
            class="whitespace-nowrap text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
          >
            {{ subtitle }}
          </p>
        </div>
      </header>

      <div class="mt-[16px] lg:mt-[32px]">
        <slot />
      </div>
    </div>

    <div class="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <BaseBottomNav
        model-value="home"
        :routes="navRoutes"
      />
    </div>
  </main>
</template>
