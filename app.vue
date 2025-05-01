<script setup lang="ts">
const authStore = useAuthStore()
const { addInterceptor } = useApiInterceptor()

onMounted(() => {
  addInterceptor('onRequest', (event) => {
    if (event.request !== '/api/auth/refresh' && authStore.isAuthenticated) {
      event.options.headers.set(
        'Authorization',
        `Bearer ${authStore.access_token}`,
      )
    }
  })

  addInterceptor('onResponseError', async (error) => {
    if (
      error.request !== '/api/auth/refresh'
      && error.response.status === 401
    ) {
      return authStore.refresh()
    }

    return Promise.reject(error)
  })
})
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
