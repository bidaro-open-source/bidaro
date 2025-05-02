<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth-only',
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
    <br>

    <ProfileInformation />
    <br>
    <ProfileSessions />
    <br>
    <ProfileActions />

    <div v-if="auth.isAuthenticating">
      authenticating...
    </div>
  </div>
</template>
