<script setup lang="ts">
const auth = useAuthStore()

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)

async function logout() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    await auth.logout()
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="auth.isAuthenticated">
    <ErrorHanlder v-if="isError" :error="error" />

    <button :disabled="isLoading" @click="logout">
      Logout
    </button>
  </div>
</template>
