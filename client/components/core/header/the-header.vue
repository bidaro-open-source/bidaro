<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <header class="bg-default/75 backdrop-blur border-b border-default sticky top-0 z-50">
    <div class="mx-auto px-4 container flex items-center justify-between min-h-16">
      <TheHeaderLogo />

      <TheHeaderNavigation />

      <div class="w-48 flex justify-end">
        <USkeleton v-if="auth.isAuthenticating" class="h-9 w-9 mr-[6px] rounded-full" />
        <TheHeaderAuthenticated v-else-if="auth.isAuthenticated" />
        <TheHeaderAnonymous v-else />
      </div>
    </div>
  </header>
</template>
