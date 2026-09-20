<script setup lang="ts">
import {
  MobileNav as FrappeMobileNav,
  MobileNavItem as FrappeMobileNavItem,
  type MobileNavItemProps,
} from 'frappe-ui'

export type BaseBottomNavValue =
  | 'home'
  | 'quran'
  | 'tasmee'
  | 'groups'
  | 'profile'

export interface BaseBottomNavLabels {
  home: string
  quran: string
  tasmee: string
  groups: string
  profile: string
}

export type BaseBottomNavRoutes = Partial<
  Record<BaseBottomNavValue, MobileNavItemProps['to']>
>

const props = withDefaults(
  defineProps<{
    modelValue?: BaseBottomNavValue
    labels?: BaseBottomNavLabels
    routes?: BaseBottomNavRoutes
  }>(),
  {
    modelValue: 'home',
    labels: () => ({
      home: 'الرئيسية',
      quran: 'القرآن',
      tasmee: 'تسميع',
      groups: 'المجموعات',
      profile: 'حسابي',
    }),
    routes: () => ({}),
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: BaseBottomNavValue]
  select: [value: BaseBottomNavValue]
}>()

function select(value: BaseBottomNavValue) {
  emit('update:modelValue', value)
  emit('select', value)
}

function routeFor(value: BaseBottomNavValue) {
  return props.routes[value]
}
</script>

<template>
  <FrappeMobileNav
    dir="rtl"
    class="!flex !h-[76px] !w-full !shrink-0 !items-center !justify-between !border-t-0 !bg-[var(--sqc-color-background-elevated)] !px-[var(--sqc-dimension-spacing-12)] !pb-0 [font-family:var(--sqc-font-family-ui)] [@media(display-mode:standalone)]:!pb-0 [&_[data-slot=mobile-nav-item]]:!h-[56px] [&_[data-slot=mobile-nav-item]]:!min-h-0 [&_[data-slot=mobile-nav-item]]:!w-[62px] [&_[data-slot=mobile-nav-item]]:!shrink-0 [&_[data-slot=mobile-nav-item]]:!gap-[4px] [&_[data-slot=mobile-nav-item]]:!py-0 [&_[data-slot=mobile-nav-item]:nth-child(3)]:!h-[66px] [&_[data-slot=mobile-nav-item]>span:last-child]:!text-[12px] [&_[data-slot=mobile-nav-item]>span:last-child]:!font-medium [&_[data-slot=mobile-nav-item]>span:last-child]:!leading-[18px] [&_[data-slot=mobile-nav-item][data-state=active]>span:last-child]:!text-[color:var(--sqc-color-text-brand)] [&_[data-slot=mobile-nav-item][data-state=inactive]>span:last-child]:!text-[color:var(--sqc-color-text-tertiary)]"
  >
    <FrappeMobileNavItem
      :label="labels.home"
      :to="routeFor('home')"
      :active="modelValue === 'home'"
      @click="select('home')"
    >
      <template #default="{ active }">
        <span
          aria-hidden="true"
          class="block size-[20px] shrink-0 [mask-image:url('/assets/icons/nav-home-20.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/nav-home-20.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
          :class="
            active
              ? 'bg-[var(--sqc-color-text-brand)]'
              : 'bg-[var(--sqc-color-text-tertiary)]'
          "
        />
      </template>
    </FrappeMobileNavItem>

    <FrappeMobileNavItem
      :label="labels.quran"
      :to="routeFor('quran')"
      :active="modelValue === 'quran'"
      @click="select('quran')"
    >
      <template #default="{ active }">
        <span
          aria-hidden="true"
          class="block size-[20px] shrink-0 [mask-image:url('/assets/icons/nav-quran-20.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/nav-quran-20.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
          :class="
            active
              ? 'bg-[var(--sqc-color-text-brand)]'
              : 'bg-[var(--sqc-color-text-tertiary)]'
          "
        />
      </template>
    </FrappeMobileNavItem>

    <FrappeMobileNavItem
      :label="labels.tasmee"
      :to="routeFor('tasmee')"
      :active="modelValue === 'tasmee'"
      @click="select('tasmee')"
    >
      <template #default>
        <span
          aria-hidden="true"
          class="flex size-[42px] shrink-0 items-center justify-center rounded-[var(--sqc-dimension-radius-999)] bg-[var(--sqc-color-action-primary)]"
        >
          <span
            class="block size-[20px] bg-[var(--sqc-color-text-inverse)] [mask-image:url('/assets/icons/nav-tasmee-20.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/nav-tasmee-20.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
          />
        </span>
      </template>
    </FrappeMobileNavItem>

    <FrappeMobileNavItem
      :label="labels.groups"
      :to="routeFor('groups')"
      :active="modelValue === 'groups'"
      @click="select('groups')"
    >
      <template #default="{ active }">
        <span
          aria-hidden="true"
          class="block size-[20px] shrink-0 [mask-image:url('/assets/icons/nav-groups-20.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/nav-groups-20.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
          :class="
            active
              ? 'bg-[var(--sqc-color-text-brand)]'
              : 'bg-[var(--sqc-color-text-tertiary)]'
          "
        />
      </template>
    </FrappeMobileNavItem>

    <FrappeMobileNavItem
      :label="labels.profile"
      :to="routeFor('profile')"
      :active="modelValue === 'profile'"
      @click="select('profile')"
    >
      <template #default="{ active }">
        <span
          aria-hidden="true"
          class="block size-[20px] shrink-0 [mask-image:url('/assets/icons/nav-profile-20.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/assets/icons/nav-profile-20.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
          :class="
            active
              ? 'bg-[var(--sqc-color-text-brand)]'
              : 'bg-[var(--sqc-color-text-tertiary)]'
          "
        />
      </template>
    </FrappeMobileNavItem>
  </FrappeMobileNav>
</template>
