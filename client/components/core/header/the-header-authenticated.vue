<script setup lang="ts">
const auth = useAuthStore()

const name = computed(
  () => auth.user && auth.user.name ? auth.user.name : auth.user?.username,
)
</script>

<template>
  <ProfileDropdown
    :name="name || 'undefined'"
    :email="auth.user?.email || 'undefined'"
    :email-verified="!!auth.user?.emailVerifiedAt"
    @logout="auth.logout()"
  />
</template>
