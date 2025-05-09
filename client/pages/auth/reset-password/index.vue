<script setup lang="ts">
definePageRestrictions('guest')
definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div>
    <AuthResetPasswordForm />
  </div>
</template>
