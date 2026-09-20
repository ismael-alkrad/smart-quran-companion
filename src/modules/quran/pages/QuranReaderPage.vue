<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MushafPage from '@/modules/quran/components/MushafPage.vue'
import { useMushafPage } from '@/modules/quran/composables/useMushafPage'

const route = useRoute()
const router = useRouter()

const pageNumber = computed(() => {
  const value = Number(route.params.page)
  return Number.isFinite(value) ? Math.min(604, Math.max(1, value)) : 31
})

const { data: page, isPending, isError, error, refetch } = useMushafPage(pageNumber)

function movePage(delta: number) {
  const next = Math.min(604, Math.max(1, pageNumber.value + delta))
  void router.push({ name: 'quran-reader', params: { page: next } })
}
</script>

<template>
  <main class="sqc-safe-screen reader">
    <div v-if="isPending" class="reader-state" role="status">
      جاري تجهيز صفحة المصحف…
    </div>

    <div v-else-if="isError" class="reader-state reader-state--error" role="alert">
      <strong>المصحف المحلي غير جاهز</strong>
      <p>{{ error instanceof Error ? error.message : 'حدث خطأ غير متوقع.' }}</p>
      <p class="reader-state__hint">
        القرآن لا يُحمّل من Frappe أثناء التشغيل. يتم تجهيزه محليًا مرة واحدة ثم يعمل بدون إنترنت.
      </p>
      <button type="button" @click="refetch()">إعادة المحاولة</button>
    </div>

    <MushafPage v-else-if="page" :page="page" />

    <nav v-if="page" class="reader-nav" aria-label="التنقل بين صفحات المصحف">
      <button type="button" :disabled="pageNumber <= 1" @click="movePage(-1)">السابق</button>
      <button type="button" :disabled="pageNumber >= 604" @click="movePage(1)">التالي</button>
    </nav>
  </main>
</template>

<style scoped>
.reader {
  position: relative;
  background: var(--sqc-color-background-mushaf);
}

.reader-state {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 32px;
  color: var(--sqc-color-text-secondary);
  text-align: center;
}

.reader-state--error p {
  max-width: 480px;
  margin: 0;
  font-size: 0.9rem;
}

.reader-state__hint {
  color: var(--sqc-color-text-tertiary);
}

.reader-state--error button,
.reader-nav button {
  border: 1px solid var(--sqc-color-border-subtle);
  border-radius: 12px;
  background: white;
  padding: 10px 16px;
  color: var(--sqc-color-text-primary);
}

.reader-nav {
  position: fixed;
  z-index: 10;
  right: max(14px, env(safe-area-inset-right));
  bottom: max(14px, env(safe-area-inset-bottom));
  left: max(14px, env(safe-area-inset-left));
  display: flex;
  max-width: 492px;
  justify-content: space-between;
  margin-inline: auto;
  pointer-events: none;
}

.reader-nav button {
  box-shadow: 0 6px 24px rgb(45 38 28 / 10%);
  opacity: 0.82;
  pointer-events: auto;
}

.reader-nav button:disabled {
  opacity: 0.28;
}
</style>
