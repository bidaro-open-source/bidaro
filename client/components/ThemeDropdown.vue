<script setup lang="ts">
import type { DropdownMenuItem, TabsItem } from '@nuxt/ui'

const colorMode = useColorMode()

const items = ref<DropdownMenuItem[][]>([
  [
    {
      type: 'label',
      slot: 'theme' as const,
    },
  ],
])

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
      sideOffset: 22,
    }"
    :ui="{
      content: 'w-68',
    }"
  >
    <UButton
      color="neutral"
      variant="link"
      class="cursor-pointer"
      :icon="colorMode.value === 'light' ? 'i-lucide-sun' : 'i-lucide-moon'"
    />

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
  </UDropdownMenu>
</template>
