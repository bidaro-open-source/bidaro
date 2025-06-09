<script setup lang="ts">
definePageRestrictions('auth')
definePageMeta({
  layout: 'creation',
})
</script>

<template>
  <div class="mx-auto container pt-16">
    <CreateLotForm />
  </div>
</template>
