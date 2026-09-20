<script setup lang="ts">
import { Progress as FrappeProgress } from 'frappe-ui'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: number
  }>(),
  {
    value: 0,
  },
)

const normalizedValue = computed(() =>
  Math.min(100, Math.max(0, Number.isFinite(props.value) ? props.value : 0)),
)
</script>

<template>
  <FrappeProgress
    :value="normalizedValue"
    size="lg"
    class="!w-full !space-y-0 [&_[role=progressbar]]:!h-[8px] [&_[role=progressbar]]:!rounded-[var(--sqc-dimension-radius-999)] [&_[role=progressbar]]:!bg-[var(--sqc-color-background-subtle)] [&_[role=progressbar]>div]:!rounded-[var(--sqc-dimension-radius-999)] [&_[role=progressbar]>div]:!bg-[var(--sqc-color-action-primary)]"
  />
</template>
