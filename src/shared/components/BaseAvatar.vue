<script setup lang="ts">
import { Avatar as FrappeAvatar } from 'frappe-ui'
import { computed } from 'vue'

export type BaseAvatarSize = 'small' | 'medium' | 'large'
export type BaseAvatarType = 'initials' | 'placeholder'

const props = withDefaults(
  defineProps<{
    initials?: string
    size?: BaseAvatarSize
    type?: BaseAvatarType
    ariaLabel?: string
  }>(),
  {
    initials: 'إس',
    size: 'small',
    type: 'initials',
    ariaLabel: undefined,
  },
)

const avatarSizeClass = computed(() => {
  if (props.size === 'large') return 'size-[48px]'
  if (props.size === 'medium') return 'size-[40px]'
  return 'size-[32px]'
})

const initialsClasses = computed(() => {
  if (props.size === 'large') {
    return 'text-[16px] font-semibold leading-[26px]'
  }

  return 'text-[12px] font-medium leading-[18px]'
})

const placeholderClasses = computed(() => {
  if (props.size === 'large') {
    return "size-[24px] [mask-image:url('/assets/avatar/avatar-placeholder-24.svg')] [-webkit-mask-image:url('/assets/avatar/avatar-placeholder-24.svg')]"
  }

  if (props.size === 'medium') {
    return "size-[20px] [mask-image:url('/assets/avatar/avatar-placeholder-20.svg')] [-webkit-mask-image:url('/assets/avatar/avatar-placeholder-20.svg')]"
  }

  return "size-[16px] [mask-image:url('/assets/avatar/avatar-placeholder-16.svg')] [-webkit-mask-image:url('/assets/avatar/avatar-placeholder-16.svg')]"
})
</script>

<template>
  <FrappeAvatar
    size="md"
    shape="circle"
    theme="gray"
    :aria-label="ariaLabel"
    :role="ariaLabel ? 'img' : undefined"
    class="!rounded-[var(--sqc-dimension-radius-999)] [font-family:var(--sqc-font-family-ui)] [&>div]:!bg-[var(--sqc-color-background-tertiary)] [&>div]:!text-[color:var(--sqc-color-text-brand)] [&>div]:!normal-case [&>div>div]:!h-auto [&>div>div]:!w-auto"
    :class="avatarSizeClass"
  >
    <span
      v-if="type === 'initials'"
      dir="rtl"
      class="block whitespace-nowrap text-center text-[color:var(--sqc-color-text-brand)]"
      :class="initialsClasses"
    >
      {{ initials }}
    </span>

    <span
      v-else
      aria-hidden="true"
      class="block shrink-0 bg-[var(--sqc-color-text-tertiary)] [mask-repeat:no-repeat] [mask-position:center] [mask-size:100%_100%] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:100%_100%]"
      :class="placeholderClasses"
    />
  </FrappeAvatar>
</template>
