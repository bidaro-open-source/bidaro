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
    <h2 class="font-bold text-3xl">
      Налаштування
    </h2>

    <br>
    <ProfileChangeRowsForm />
    <br>
    <ProfileChangeEmailForm />
    <br>
    <ProfileChangePasswordForm />
    <br>
    <ProfileVerification v-if="auth.user?.emailVerifiedAt === null" />
  </div>
</template>
