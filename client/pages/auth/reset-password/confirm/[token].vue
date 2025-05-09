<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const auth = useAuthStore()

const route = useRoute()

const token = computed(
  () => Array.isArray(route.params.token)
    ? route.params.token[0]
    : route.params.token,
)

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
    <AuthConfirmPasswordForm :token="token" />
  </div>
</template>
