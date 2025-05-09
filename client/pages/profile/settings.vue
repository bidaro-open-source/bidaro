<script setup lang="ts">
definePageRestrictions('auth')
definePageMeta({
  layout: 'profile',
})

const auth = useAuthStore()
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
