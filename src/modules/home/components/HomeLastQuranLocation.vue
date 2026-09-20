<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    locationText?: string
  }>(),
  {
    locationText: 'سورة البقرة · متابعة من آخر موضع',
  },
)

const emit = defineEmits<{
  resume: []
}>()
</script>

<template>
  <button
    type="button"
    dir="ltr"
    class="flex h-[108px] w-full items-center justify-between rounded-[18px] bg-[var(--sqc-color-background-elevated)] p-[var(--sqc-dimension-spacing-16)] text-right [font-family:var(--sqc-font-family-ui)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sqc-color-border-focus)]"
    @click="emit('resume')"
  >
    <span
      dir="auto"
      class="shrink-0 text-[12px] font-medium leading-[18px] text-[color:var(--sqc-color-text-brand)]"
    >
      متابعة
    </span>

    <span dir="rtl" class="flex min-w-0 flex-col items-end gap-[4px] overflow-hidden">
      <span
        dir="auto"
        class="whitespace-nowrap text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
      >
        آخر موضع في القرآن
      </span>

      <span
        dir="auto"
        class="max-w-full truncate text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
      >
        {{ props.locationText }}
      </span>
    </span>
  </button>
</template>
