<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuthStore()

const password = ref('')

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function changePassword() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    const data = await $api.profile.updateProfile({
      body: { password: password.value },
    })

    auth.user = data
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
      Password success changed!

      <button @click="isSuccess = false">
        close
      </button>
    </div>

    <div>
      <label for="password-from">New password:</label>
      <input
        id="password-from"
        v-model="password"
        type="password"
        placeholder="Password"
      >
    </div>

    <button :disabled="isLoading" @click="changePassword">
      Change password
    </button>
  </div>
</template>
