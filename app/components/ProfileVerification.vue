<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuthStore()

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function changeEmail() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    await $api.profile.verifyEmailProfile()

    isSuccess.value = true
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

    <div v-if="isSuccess">
      We sent a verification token to your email!

      <button @click="isSuccess = false">
        close
      </button>
    </div>

    <button :disabled="isLoading" @click="changeEmail">
      Send verification token
    </button>
  </div>
</template>
