<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div
    class="relative flex h-[32px] w-[calc(100%+36px)] items-center justify-center overflow-hidden text-[12px] font-semibold text-[color:var(--sqc-poc-accent-strong)]"
  >
    <svg
      viewBox="0 0 460 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path
        d="M4 20C15 8 26 6 44 6H416C434 6 445 8 456 20C445 32 434 34 416 34H44C26 34 15 32 4 20Z"
        fill="var(--sqc-color-mushaf-paper)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.2"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M36 11H424M36 29H424"
        fill="none"
        stroke="var(--sqc-poc-accent-soft)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M8 20 18 12l10 8-10 8ZM452 20l-10-8-10 8 10 8Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M22 20 29 15l7 5-7 5ZM438 20l-7-5-7 5 7 5Z"
        fill="var(--sqc-poc-accent)"
        opacity=".72"
      />
      <path
        d="M70 8 78 4 86 8 78 12ZM390 8l-8-4-8 4 8 4ZM70 32l8-4 8 4-8 4ZM390 32l-8-4-8 4 8 4Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width=".8"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <span class="relative z-10 truncate px-[24px]">
      {{ label }}
    </span>
  </div>
</template>
