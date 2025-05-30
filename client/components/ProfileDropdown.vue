<script setup lang="ts">
import type { DropdownMenuItem, TabsItem } from '@nuxt/ui'

const props = defineProps<{
  name: string
  email: string
  emailVerified: boolean
}>()

const emit = defineEmits(['logout'])

const colorMode = useColorMode()

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

const tabs = ref<TabsItem[]>([
  {
    value: 'light',
    icon: 'i-lucide-sun',
    label: 'Light',
  },
  {
    value: 'dark',
    icon: 'i-lucide-moon',
    label: 'Dark',
  },
  {
    value: 'system',
    icon: 'i-lucide-monitor',
    label: 'System',
  },
])
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
      <UTabs
        v-model="colorMode.preference"
        :items="tabs"
        :content="false"
        color="neutral"
        class="w-full"
        size="xs"
      />
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
