<script setup lang="ts">
import type { LotResource } from '~~/server/resources/lot.resource'

definePageRestrictions('auth')
definePageMeta({
  layout: 'profile',
})

const auth = useAuthStore()

const data = ref<LotResource[]>([])
const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)

onMounted(async () => {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    const { $api } = useNuxtApp()

    data.value = await $api.users.fetchUserLots({
      params: { id: auth.user?.id || 0 },
    }) as LotResource[]
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <ErrorHandler v-if="isError" :error="error" />

    <div v-if="isLoading">
      Loading....
    </div>
    <div v-else>
      <ul>
        <li v-for="lot in data" :key="lot.id">
          {{ lot.title }} - {{ lot.status }}
        </li>
      </ul>
    </div>
  </div>
</template>
