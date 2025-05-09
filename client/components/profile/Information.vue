<script setup lang="ts">
const auth = useAuthStore()

const name = computed(
  () => auth.user && auth.user.name ? auth.user.name : auth.user?.username,
)
</script>

<template>
  <div v-if="auth.isAuthenticated && auth.user">
    <ul>
      <li><b>Hello, {{ name }}!</b></li>
      <li>
        Email:
        {{ auth.user.email }}
        {{ auth.user.emailVerifiedAt ? '(verified)' : '(not verified)' }}
      </li>
    </ul>
  </div>
</template>
