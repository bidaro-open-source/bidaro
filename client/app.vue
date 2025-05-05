<script setup lang="ts">
useAuthInitialize()
useAuthRepeatReqestFeature()
useAuthHeadersRequestFeature()
useAuthAutorefreshFeature()
useAuthMultitabsFeature()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
