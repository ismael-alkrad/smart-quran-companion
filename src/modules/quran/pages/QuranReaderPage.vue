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
  </main>
</template>

<style scoped>
.reader {
  position: relative;
  overflow-x: clip;
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

.reader-state--error button {
  border: 1px solid var(--sqc-color-border-subtle);
  border-radius: 12px;
  background: white;
  padding: 10px 16px;
  color: var(--sqc-color-text-primary);
}
</style>
