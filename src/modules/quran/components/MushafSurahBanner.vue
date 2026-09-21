<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div
    class="relative flex h-[36px] w-[calc(100%+30px)] items-center justify-center"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-[4px] top-1/2 flex -translate-y-1/2 items-center justify-between"
    >
      <svg
        viewBox="0 0 104 30"
        preserveAspectRatio="xMinYMid meet"
        class="h-[30px] w-[96px] shrink-0"
      >
        <path
          d="M3 15H94"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M7 15C14 6 23 6 30 15C37 24 46 24 53 15C60 6 69 6 76 15"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".9"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M18 15C22 10 27 9 32 12C28 14 26 18 27 22C23 19 20 17 18 15Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".75"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M43 15C47 10 52 9 57 12C53 14 51 18 52 22C48 19 45 17 43 15Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".75"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M71 15 78 9 85 15 78 21Z"
          fill="var(--sqc-poc-accent)"
          opacity=".66"
        />

        <circle
          cx="78"
          cy="15"
          r="1.8"
          fill="var(--sqc-poc-accent-strong)"
        />

        <path
          d="M86 15H101"
          fill="none"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <svg
        viewBox="0 0 104 30"
        preserveAspectRatio="xMaxYMid meet"
        class="h-[30px] w-[96px] shrink-0"
      >
        <g transform="translate(104 0) scale(-1 1)">
          <path
            d="M3 15H94"
            fill="none"
            stroke="var(--sqc-poc-accent-border)"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />

          <path
            d="M7 15C14 6 23 6 30 15C37 24 46 24 53 15C60 6 69 6 76 15"
            fill="none"
            stroke="var(--sqc-poc-accent-border)"
            stroke-width=".9"
            vector-effect="non-scaling-stroke"
          />

          <path
            d="M18 15C22 10 27 9 32 12C28 14 26 18 27 22C23 19 20 17 18 15Z"
            fill="var(--sqc-poc-accent-soft)"
            stroke="var(--sqc-poc-accent-border)"
            stroke-width=".75"
            vector-effect="non-scaling-stroke"
          />

          <path
            d="M43 15C47 10 52 9 57 12C53 14 51 18 52 22C48 19 45 17 43 15Z"
            fill="var(--sqc-poc-accent-soft)"
            stroke="var(--sqc-poc-accent-border)"
            stroke-width=".75"
            vector-effect="non-scaling-stroke"
          />

          <path
            d="M71 15 78 9 85 15 78 21Z"
            fill="var(--sqc-poc-accent)"
            opacity=".66"
          />

          <circle
            cx="78"
            cy="15"
            r="1.8"
            fill="var(--sqc-poc-accent-strong)"
          />

          <path
            d="M86 15H101"
            fill="none"
            stroke="var(--sqc-poc-accent-border)"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>

    <div
      class="relative z-10 flex h-[30px] min-w-[156px] max-w-[72%] items-center justify-center px-[28px] text-[11px] font-semibold text-[color:var(--sqc-poc-accent-strong)]"
    >
      <svg
        viewBox="0 0 190 38"
        preserveAspectRatio="none"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d="M20 2H170L188 19L170 36H20L2 19Z"
          fill="var(--sqc-color-mushaf-paper)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width="1.15"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M24 6H166L179 19L166 32H24L11 19Z"
          fill="none"
          stroke="var(--sqc-poc-accent-soft)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M15 19 21 13 27 19 21 25ZM175 19l-6-6-6 6 6 6Z"
          fill="var(--sqc-poc-accent-soft)"
          stroke="var(--sqc-poc-accent-border)"
          stroke-width=".8"
          vector-effect="non-scaling-stroke"
        />

        <path
          d="M29 8 35 5 41 8 35 11ZM149 8l6-3 6 3-6 3ZM29 30l6-3 6 3-6 3ZM149 30l6-3 6 3-6 3Z"
          fill="var(--sqc-poc-accent)"
          opacity=".5"
        />

        <circle
          cx="21"
          cy="19"
          r="1.6"
          fill="var(--sqc-poc-accent-strong)"
        />

        <circle
          cx="169"
          cy="19"
          r="1.6"
          fill="var(--sqc-poc-accent-strong)"
        />
      </svg>

      <span class="relative z-10 truncate">
        {{ label }}
      </span>
    </div>
  </div>
</template>
