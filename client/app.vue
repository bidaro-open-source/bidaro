<script setup lang="ts">
await useAuthInitialize()
useAuthRepeatReqestFeature()
useAuthHeadersRequestFeature()
useAuthAutorefreshFeature()
useAuthMultitabsFeature()
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
