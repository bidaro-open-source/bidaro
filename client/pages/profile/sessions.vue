<script setup lang="ts">
definePageMeta({
  layout: 'profile',
})

const auth = useAuthStore()

watch(
  () => ({
    isAuthenticating: auth.isAuthenticating,
    isAuthenticated: auth.isAuthenticated,
  }),
  ({ isAuthenticated, isAuthenticating }) => {
    if (!isAuthenticating && !isAuthenticated)
      navigateTo('/auth/login')
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <ProfileSessions />
  </div>
</template>
