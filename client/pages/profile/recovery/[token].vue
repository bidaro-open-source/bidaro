<script setup lang="ts">
definePageRestrictions('guest')
definePageMeta({
  layout: 'auth',
})

const route = useRoute()

const token = computed(
  () => Array.isArray(route.params.token)
    ? route.params.token[0]
    : route.params.token,
)
</script>

<template>
  <div>
    <ProfileRecoveryConfirmPasswordForm :token="token || 'undefined'" />
  </div>
</template>
