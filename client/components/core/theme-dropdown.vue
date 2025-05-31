<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const colorMode = useColorMode()

const items = ref<DropdownMenuItem[][]>([
  [
    {
      type: 'label',
      slot: 'theme' as const,
    },
  ],
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{
      align: 'end',
      side: 'bottom',
      sideOffset: 18,
    }"
    :ui="{
      content: 'w-68',
    }"
  >
    <UButton color="neutral" variant="link" class="cursor-pointer">
      <template #trailing>
        <ColorScheme>
          <UIcon :name="colorMode.value === 'light' ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-5" />

          <template #placeholder>
            <UIcon name="i-lucide-sun" class="size-5" />
          </template>
        </ColorScheme>
      </template>
    </UButton>

    <template #theme>
      <ThemeSwitcher />
    </template>
  </UDropdownMenu>
</template>
