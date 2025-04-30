<script setup lang="ts">
const authStore = useAuthStore()

onMounted(authStore.refresh)
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
