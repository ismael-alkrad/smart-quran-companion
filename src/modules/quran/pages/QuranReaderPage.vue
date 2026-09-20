<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import MushafPage from '@/modules/quran/components/MushafPage.vue'
import { useMushafPage } from '@/modules/quran/composables/useMushafPage'

const route = useRoute()

const pageNumber = computed(() => {
  const value = Number(route.params.page)
  return Number.isFinite(value) ? Math.min(604, Math.max(1, value)) : 31
})

const { data: page, isPending, isError, error, refetch } = useMushafPage(pageNumber)
</script>

<template>
  <main
    class="relative min-h-dvh min-w-[320px] overflow-x-clip bg-[#fbf7ef] pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
  >
    <div
      v-if="isPending"
      class="grid min-h-dvh place-items-center content-center gap-2.5 p-8 text-center text-stone-600"
      role="status"
    >
      جاري تجهيز صفحة المصحف…
    </div>

    <div
      v-else-if="isError"
      class="grid min-h-dvh place-items-center content-center gap-2.5 p-8 text-center text-stone-600"
      role="alert"
    >
      <strong>المصحف المحلي غير جاهز</strong>
      <p class="m-0 max-w-[480px] text-sm">
        {{ error instanceof Error ? error.message : 'حدث خطأ غير متوقع.' }}
      </p>
      <p class="m-0 max-w-[480px] text-sm text-stone-500">
        القرآن لا يُحمّل من Frappe أثناء التشغيل. يتم تجهيزه محليًا مرة واحدة ثم يعمل بدون إنترنت.
      </p>
      <button
        type="button"
        class="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-900"
        @click="refetch()"
      >
        إعادة المحاولة
      </button>
    </div>

    <MushafPage v-else-if="page" :page="page" />
  </main>
</template>
