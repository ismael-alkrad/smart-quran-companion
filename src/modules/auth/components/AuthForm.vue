<script setup lang="ts">
import type { AuthFormFooterVariant } from '@/modules/auth/types/form'

const props = withDefaults(
  defineProps<{
    footerText?: string
    footerVariant?: AuthFormFooterVariant
  }>(),
  {
    footerText: undefined,
    footerVariant: 'note',
  },
)

const emit = defineEmits<{
  footer: []
}>()
</script>

<template>
  <div
    dir="rtl"
    class="flex w-full flex-col items-end gap-[12px] [font-family:var(--sqc-font-family-ui)]"
  >
    <slot />

    <button
      v-if="props.footerText && props.footerVariant === 'action'"
      type="button"
      dir="auto"
      class="bg-transparent p-0 text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-brand)] [font-family:var(--sqc-font-family-ui)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sqc-color-border-focus)]"
      @click="emit('footer')"
    >
      {{ props.footerText }}
    </button>

    <p
      v-else-if="props.footerText"
      dir="auto"
      class="w-full text-right text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-tertiary)]"
    >
      {{ props.footerText }}
    </p>
  </div>
</template>
