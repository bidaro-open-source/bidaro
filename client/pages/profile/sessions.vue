<script setup lang="ts">
definePageRestrictions('auth')
definePageMeta({
  layout: 'profile',
})
</script>

<template>
  <div>
    <ProfileSessions />
  </div>
</template>
