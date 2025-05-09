<script setup lang="ts">
useAuthInitialize()
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
