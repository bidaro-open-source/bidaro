<script setup lang="ts">
const authStore = useAuthStore()
const { addInterceptor } = useApiInterceptor()

onMounted(() => {
  addInterceptor('onRequest', (event) => {
    if (authStore.isAuthenticated) {
      event.options.headers.set(
        'Authorization',
        `Bearer ${authStore.access_token}`,
      )
    }
  })

  authStore.refresh()
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
