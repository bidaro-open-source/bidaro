<script setup lang="ts">
definePageRestrictions('guest')
definePageMeta({
  layout: 'auth',
})
</script>

<template>
  <div>
    <AuthRegisterForm />
  </div>
</template>
