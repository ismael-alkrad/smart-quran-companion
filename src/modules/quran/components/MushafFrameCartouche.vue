<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)
</script>

<template>
  <div
    class="relative flex items-center justify-center text-[color:var(--sqc-poc-accent-strong)]"
    :class="
      compact
        ? 'h-[24px] min-w-[54px] px-[15px] text-[11px] font-semibold'
        : 'h-[30px] min-w-[116px] px-[22px] text-[11px] font-semibold'
    "
  >
    <svg
      viewBox="0 0 160 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full"
    >
      <path
        d="M18 3H142C146 3 149 6 149 10V30C149 34 146 37 142 37H18C14 37 11 34 11 30V10C11 6 14 3 18 3Z"
        fill="var(--sqc-color-mushaf-paper)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.2"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M11 11 3 20l8 9M149 11l8 9-8 9"
        fill="var(--sqc-color-mushaf-paper)"
        stroke="var(--sqc-poc-accent-border)"
        stroke-width="1.2"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M18 8H142M18 32H142"
        fill="none"
        stroke="var(--sqc-poc-accent-soft)"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
      />

      <path
        d="M7 20 11 16 15 20 11 24ZM153 20l-4-4-4 4 4 4Z"
        fill="var(--sqc-poc-accent)"
        opacity=".74"
      />

      <circle
        cx="11"
        cy="20"
        r="1.4"
        fill="var(--sqc-poc-accent-strong)"
      />

      <circle
        cx="149"
        cy="20"
        r="1.4"
        fill="var(--sqc-poc-accent-strong)"
      />
    </svg>

    <span class="relative z-10 truncate">
      <slot />
    </span>
  </div>
</template>
