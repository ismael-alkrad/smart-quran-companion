<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'أو المتابعة بالبريد الإلكتروني',
  },
)
</script>

<template>
  <div
    class="flex h-[28px] w-full items-center gap-[12px] [font-family:var(--sqc-font-family-ui)]"
  >
    <span
      class="h-px w-[90px] shrink-0 bg-[var(--sqc-color-border-subtle)]"
      aria-hidden="true"
    />

    <p
      dir="auto"
      class="min-w-0 flex-1 break-words text-center text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-tertiary)]"
    >
      {{ label }}
    </p>

    <span
      class="h-px w-[90px] shrink-0 bg-[var(--sqc-color-border-subtle)]"
      aria-hidden="true"
    />
  </div>
</template>
