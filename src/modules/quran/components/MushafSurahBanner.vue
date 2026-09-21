<script setup lang="ts">
import MushafFrameCartouche from '@/modules/quran/components/MushafFrameCartouche.vue'

defineProps<{
  label: string
}>()
</script>

<template>
  <div
    class="relative flex h-[34px] w-[calc(100%+34px)] items-center justify-center"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-[8px] top-1/2 h-[18px] -translate-y-1/2"
    >
      <div
        class="absolute inset-x-[18px] top-[4px] h-px bg-[var(--sqc-poc-accent-border)]"
      />
      <div
        class="absolute inset-x-[18px] bottom-[4px] h-px bg-[var(--sqc-poc-accent-border)]"
      />

      <div
        class="absolute left-[4px] top-1/2 size-[10px] -translate-y-1/2 rotate-45 border border-[var(--sqc-poc-accent-border)] bg-[var(--sqc-poc-accent-soft)]"
      />
      <div
        class="absolute right-[4px] top-1/2 size-[10px] -translate-y-1/2 rotate-45 border border-[var(--sqc-poc-accent-border)] bg-[var(--sqc-poc-accent-soft)]"
      />

      <div
        class="absolute left-[22px] top-1/2 size-[5px] -translate-y-1/2 rotate-45 bg-[var(--sqc-poc-accent)]"
      />
      <div
        class="absolute right-[22px] top-1/2 size-[5px] -translate-y-1/2 rotate-45 bg-[var(--sqc-poc-accent)]"
      />
    </div>

    <MushafFrameCartouche
      class="relative z-10 min-w-[150px] max-w-[72%] bg-[var(--sqc-color-mushaf-paper)]"
    >
      {{ label }}
    </MushafFrameCartouche>
  </div>
</template>
