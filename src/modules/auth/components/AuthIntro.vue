<script setup lang="ts">
import type { AuthIntroVariant } from '@/modules/auth/types/intro'

const props = withDefaults(
  defineProps<{
    variant?: AuthIntroVariant
    eyebrow?: string
    title: string
    description?: string
  }>(),
  {
    variant: 'standard',
    eyebrow: undefined,
    description: undefined,
  },
)
</script>

<template>
  <div
    dir="rtl"
    class="flex w-full flex-col items-end text-right [font-family:var(--sqc-font-family-ui)] [word-break:break-word]"
    :class="props.variant === 'hero' ? 'gap-[6px]' : 'gap-[4px]'"
  >
    <p
      v-if="props.variant === 'hero' && props.eyebrow"
      class="shrink-0 whitespace-nowrap text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-brand)]"
    >
      {{ props.eyebrow }}
    </p>

    <h1
      v-if="props.variant === 'hero'"
      dir="auto"
      class="w-full shrink-0 text-[24px] font-semibold leading-[36px] text-[color:var(--sqc-color-text-primary)]"
    >
      {{ props.title }}
    </h1>

    <h2
      v-else
      dir="auto"
      class="w-full shrink-0 text-[20px] font-medium leading-[32px] text-[color:var(--sqc-color-text-primary)]"
    >
      {{ props.title }}
    </h2>

    <p
      v-if="props.description"
      dir="auto"
      class="w-full shrink-0 text-[14px] font-normal leading-[24px] text-[color:var(--sqc-color-text-secondary)]"
    >
      {{ props.description }}
    </p>
  </div>
</template>
