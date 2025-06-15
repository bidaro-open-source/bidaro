<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Профіль',
    to: '/profile',
  },
  {
    label: 'Мої лоти',
    to: '/profile/lots',
  },
  {
    label: 'Мої ставки',
    to: '/profile/bets',
  },
  {
    label: 'Налаштування',
    to: '/profile/settings',
  },
  {
    label: 'Сесії',
    to: '/profile/sessions',
  },
])
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader />

    <div class="mx-auto container pt-8 flex gap-14">
      <div class="w-full max-w-3xs">
        <UNavigationMenu
          color="neutral"
          orientation="vertical"
          variant="pill"
          :items="items"
          class="w-full"
        />
      </div>
      <div class="w-full">
        <slot></slot>
      </div>
    </div>

    <TheFooter class="mt-auto" />
  </div>
</template>
