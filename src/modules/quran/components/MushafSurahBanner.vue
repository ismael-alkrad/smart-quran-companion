<script setup lang="ts">
import MushafFrameCartouche from '@/modules/quran/components/MushafFrameCartouche.vue'

defineProps<{
  label: string
}>()
</script>

<template>
  <div
    class="relative flex h-[34px] w-[calc(100%+30px)] items-center justify-center"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-[10px] top-1/2 -translate-y-1/2"
    >
      <div
        class="absolute left-[28px] right-[28px] top-1/2 h-px -translate-y-1/2 bg-[var(--sqc-poc-accent-border)]"
      />

      <div
        class="absolute left-[28px] right-[28px] top-[calc(50%+4px)] h-px bg-[var(--sqc-poc-accent-soft)]"
      />

      <svg
        viewBox="0 0 30 22"
        aria-hidden="true"
        class="absolute left-0 top-1/2 h-[22px] w-[30px] -translate-y-1/2"
      >
        <path
          d="M2 11C7 5 12 4 18 7C15 9 14 12 15 15C10 14 6 13 2 11Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".9"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M11 11 17 6 23 11 17 16Z"
          fill="var(--sqc-poc-accent)"
          opacity=".68"
        />
        <circle
          cx="17"
          cy="11"
          r="1.5"
          fill="var(--sqc-poc-accent-strong)"
        />
        <path
          d="M22 11H30"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".9"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <svg
        viewBox="0 0 30 22"
        aria-hidden="true"
        class="absolute right-0 top-1/2 h-[22px] w-[30px] -translate-y-1/2"
      >
        <g transform="translate(30 0) scale(-1 1)">
          <path
            d="M2 11C7 5 12 4 18 7C15 9 14 12 15 15C10 14 6 13 2 11Z"
            fill="var(--sqc-poc-accent-soft)"
            stroke="var(--sqc-poc-accent-border)"
            stroke-width=".9"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M11 11 17 6 23 11 17 16Z"
            fill="var(--sqc-poc-accent)"
            opacity=".68"
          />
          <circle
            cx="17"
            cy="11"
            r="1.5"
            fill="var(--sqc-poc-accent-strong)"
          />
          <path
            d="M22 11H30"
            stroke="var(--sqc-poc-accent-border)"
            stroke-width=".9"
            vector-effect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>

    <MushafFrameCartouche
      class="relative z-10 min-w-[146px] max-w-[70%] bg-[var(--sqc-color-mushaf-paper)]"
    >
      {{ label }}
    </MushafFrameCartouche>
  </div>
</template>
