<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div
    class="relative flex h-[32px] w-[calc(100%+36px)] items-center justify-center text-[12px] font-semibold text-[color:var(--sqc-poc-accent-strong)]"
  >
    <svg
      viewBox="0 0 54 40"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-0 h-full w-[54px]"
    >
      <path
        d="M2 20C11 9 20 6 38 6H54V34H38C20 34 11 31 2 20Z"
        fill="var(--sqc-color-mushaf-paper)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.2"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M10 20 20 12l10 8-10 8Z"
        fill="var(--sqc-poc-accent-soft)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M23 20 30 15l7 5-7 5Z"
        fill="var(--sqc-poc-accent)"
        opacity=".72"
      />
      <path
        d="M38 8 46 4 54 8M38 32l8 4 8-4"
        fill="none"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width=".8"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-[5px] left-[50px] right-[50px] border-y border-[var(--sqc-poc-accent-border)] bg-[var(--sqc-color-mushaf-paper)]"
    >
      <div
        class="absolute inset-x-0 top-[3px] h-px bg-[var(--sqc-poc-accent-soft)]"
      />
      <div
        class="absolute inset-x-0 bottom-[3px] h-px bg-[var(--sqc-poc-accent-soft)]"
      />
    </div>

    <svg
      viewBox="0 0 54 40"
      preserveAspectRatio="xMaxYMid meet"
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 right-0 h-full w-[54px]"
    >
      <g transform="translate(54 0) scale(-1 1)">
        <path
          d="M2 20C11 9 20 6 38 6H54V34H38C20 34 11 31 2 20Z"
          fill="var(--sqc-color-mushaf-paper)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1.2"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M10 20 20 12l10 8-10 8Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M23 20 30 15l7 5-7 5Z"
          fill="var(--sqc-poc-accent)"
          opacity=".72"
        />
        <path
          d="M38 8 46 4 54 8M38 32l8 4 8-4"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".8"
          vector-effect="non-scaling-stroke"
        />
      </g>
    </svg>

    <span
      class="relative z-10 max-w-[70%] truncate bg-[var(--sqc-color-mushaf-paper)] px-[14px]"
    >
      {{ label }}
    </span>
  </div>
</template>
