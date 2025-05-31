<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const colorMode = useColorMode()

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
  <UTabs
    v-model="colorMode.preference"
    :items="tabs"
    :content="false"
    color="neutral"
    class="w-full"
    size="xs"
  />
</template>
