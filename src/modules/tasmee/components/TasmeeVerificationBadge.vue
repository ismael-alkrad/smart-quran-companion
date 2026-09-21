<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'الجلسة محفوظة',
  },
)
</script>

<template>
  <div
    dir="rtl"
    class="inline-flex items-center gap-[var(--sqc-dimension-spacing-8)] rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-verification-self-background)] px-[var(--sqc-dimension-spacing-12)] py-[var(--sqc-dimension-spacing-8)] text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-verification-self-foreground)] [font-family:var(--sqc-font-family-ui)]"
  >
    <span
      aria-hidden="true"
      class="size-[8px] shrink-0 rounded-full bg-[var(--sqc-color-verification-self-foreground)]"
    />
    {{ label }}
  </div>
</template>
