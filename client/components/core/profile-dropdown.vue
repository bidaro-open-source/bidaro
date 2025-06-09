<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const props = defineProps<{
  name: string
  email: string
  emailVerified: boolean
}>()

const emit = defineEmits(['logout'])

const items = computed(() => {
  const baseItems: DropdownMenuItem[][] = [
    [
      {
        type: 'label',
        slot: 'user' as const,
      },
    ],
    [
      {
        type: 'label',
        slot: 'theme' as const,
      },
    ],
    [
      {
        label: 'Особиста сторінка',
        icon: 'i-lucide-user',
        to: '/profile',
      },
      {
        label: 'Мої лоти',
        icon: 'i-lucide-user',
        to: '/profile/lots',
      },
      {
        label: 'Налаштування',
        icon: 'i-lucide-cog',
        to: '/profile/settings',
      },
      {
        label: 'Активні сесії',
        icon: 'i-lucide-monitor-smartphone',
        to: '/profile/sessions',
      },
    ],
  ]

  if (!props.emailVerified) {
    baseItems.push([
      {
        type: 'label',
        slot: 'verification' as const,
      },
    ])
  }

  baseItems.push([
    {
      label: 'Вийти',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: () => emit('logout'),
    },
  ])

  return baseItems
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{
      align: 'end',
      side: 'bottom',
      sideOffset: 0,
    }"
    :ui="{
      content: 'w-68',
    }"
  >
    <UButton
      :avatar="{
        alt: name,
        size: 'lg',
      }"
      color="neutral"
      variant="link"
      class="cursor-pointer"
    />

    <template #user>
      <div class="w-full flex items-center gap-2">
        <UAvatar :alt="name" size="xl" />
        <div>
          <div>{{ name }}</div>
          <div class="font-normal">
            {{ email }}
          </div>
        </div>
      </div>
    </template>

    <template #theme>
      <ThemeSwitcher />
    </template>

    <template #verification>
      <UButton
        color="warning"
        variant="subtle"
        class="w-full justify-center"
        href="/profile/settings"
      >
        Підтвердити пошту
      </UButton>
    </template>
  </UDropdownMenu>
</template>
