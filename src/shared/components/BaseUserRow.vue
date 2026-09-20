<script setup lang="ts">
import BaseAvatar from '@/shared/components/BaseAvatar.vue'

const props = withDefaults(
  defineProps<{
    name?: string
    meta?: string
    initials?: string
    selected?: boolean
    ariaLabel?: string
  }>(),
  {
    name: 'إسماعيل',
    meta: '12 يومًا متتاليًا',
    initials: 'إس',
    selected: false,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    type="button"
    dir="rtl"
    :aria-label="ariaLabel ?? name"
    :aria-current="selected ? 'page' : undefined"
    class="flex h-[72px] w-[358px] max-w-full items-center gap-[var(--sqc-dimension-spacing-12)] rounded-[var(--sqc-dimension-radius-12)] px-[var(--sqc-dimension-spacing-12)] text-right [font-family:var(--sqc-font-family-ui)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sqc-color-border-focus)]"
    :class="
      selected
        ? 'bg-[var(--sqc-color-background-tertiary)]'
        : 'bg-[var(--sqc-color-background-elevated)]'
    "
    @click="emit('click', $event)"
  >
    <BaseAvatar
      size="medium"
      type="initials"
      :initials="initials"
      :aria-label="name"
      class="shrink-0"
    />

    <span
      class="flex min-w-0 flex-1 flex-col items-end gap-[var(--sqc-dimension-spacing-4)] overflow-hidden text-right"
    >
      <span
        dir="auto"
        class="w-full truncate text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
      >
        {{ name }}
      </span>

      <span
        dir="auto"
        class="w-full truncate text-[12px] font-normal leading-[20px] text-[color:var(--sqc-color-text-secondary)]"
      >
        {{ meta }}
      </span>
    </span>

    <span
      aria-hidden="true"
      class="block size-[18px] shrink-0 bg-[var(--sqc-color-text-tertiary)] [mask-image:url('/assets/icons/forward-rtl-18.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/forward-rtl-18.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
    />
  </button>
</template>
