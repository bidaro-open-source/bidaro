<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const auth = useAuthStore()

watch(
  () => ({
    isAuthenticating: auth.isAuthenticating,
    isAuthenticated: auth.isAuthenticated,
  }),
  ({ isAuthenticated, isAuthenticating }) => {
    if (!isAuthenticating && isAuthenticated)
      navigateTo('/profile')
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <RegisterForm />
  </div>
</template>
