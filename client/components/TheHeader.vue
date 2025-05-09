<script setup lang="ts">
const auth = useAuthStore()
</script>

<!-- eslint-disable -->
<template>
  <header class="bg-default/75 backdrop-blur border-b border-default sticky top-0 z-50">
    <div class="mx-auto container flex items-center justify-between min-h-14">
      <NuxtLink href="/" class="text-2xl font-medium">Bidaro</NuxtLink>

      <USkeleton v-if="auth.isAuthenticating" class="h-7 w-30 rounded" />
      <div v-else-if="auth.isAuthenticated" class="flex gap-2">
        <UButton color="neutral" variant="outline" href="/profile">Профіль</UButton>
        <UButton color="error" variant="outline" @click="auth.logout">Вийти</UButton>
      </div>
      <div v-else class="flex gap-2">
        <UButton color="neutral" variant="outline" href="/auth/login">Увійти</UButton>
        <UButton color="neutral" href="/auth/register">Реєстрація</UButton>
      </div>
    </div>
  </header>
</template>
 <!-- eslint-enable -->
