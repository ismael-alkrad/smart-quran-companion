<script setup lang="ts">
import { Button as FrappeButton } from 'frappe-ui'

export type BaseAppBarType = 'default' | 'back' | 'search'

const props = withDefaults(
  defineProps<{
    title?: string
    type?: BaseAppBarType
    backLabel?: string
    searchLabel?: string
    actionDisabled?: boolean
  }>(),
  {
    title: 'الصفحة الرئيسية',
    type: 'default',
    backLabel: 'رجوع',
    searchLabel: 'بحث',
    actionDisabled: false,
  },
)

const emit = defineEmits<{
  back: []
  search: []
}>()

function handleAction() {
  if (props.actionDisabled) return

  if (props.type === 'back') {
    emit('back')
    return
  }

  if (props.type === 'search') {
    emit('search')
  }
}
</script>

<template>
  <header
    dir="rtl"
    class="flex h-[56px] w-full items-center justify-between bg-[var(--sqc-color-background-primary)] px-[var(--sqc-dimension-spacing-16)] [font-family:var(--sqc-font-family-ui)]"
  >
    <span
      v-if="type === 'default'"
      aria-hidden="true"
      class="block size-[40px] shrink-0"
    />

    <FrappeButton
      v-else
      theme="gray"
      variant="ghost"
      size="md"
      type="button"
      :label="type === 'back' ? backLabel : searchLabel"
      :disabled="actionDisabled"
      class="!size-[40px] !shrink-0 !rounded-[var(--sqc-dimension-radius-999)] !bg-transparent !p-0 !text-[color:var(--sqc-color-text-primary)] hover:!bg-[var(--sqc-color-background-subtle)] active:!bg-[var(--sqc-color-background-tertiary)] focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-[var(--sqc-color-border-focus)]"
      @click="handleAction"
    >
      <template #icon>
        <span
          v-if="type === 'back'"
          aria-hidden="true"
          class="block size-[20px] shrink-0 bg-[var(--sqc-color-text-primary)] [mask-image:url('/assets/icons/back-rtl-20.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/back-rtl-20.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
        />
        <span
          v-else
          aria-hidden="true"
          class="block size-[20px] shrink-0 bg-[var(--sqc-color-text-primary)] [mask-image:url('/assets/icons/search-20.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/search-20.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
        />
      </template>
    </FrappeButton>

    <h1
      dir="rtl"
      class="min-w-0 truncate text-center text-[16px] font-semibold leading-[26px] text-[color:var(--sqc-color-text-primary)]"
    >
      {{ title }}
    </h1>

    <span aria-hidden="true" class="block size-[40px] shrink-0" />
  </header>
</template>
