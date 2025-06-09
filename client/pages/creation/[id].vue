<script setup lang="ts">
definePageRestrictions('auth')
definePageMeta({
  layout: 'creation',
})

const route = useRoute()

const id = Array.isArray(route.params.id)
  ? route.params.id[0]
  : route.params.id
</script>

<template>
  <div>
    <UpdateLotForm :id="id || 'undefined'" />
  </div>
</template>
