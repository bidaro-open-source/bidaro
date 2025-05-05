<script setup lang="ts">
const api = useApiStore()
const auth = useAuthStore()

const email = ref('')

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function changeEmail() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    const data = await api.profile.updateProfile({
      body: { email: email.value },
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
      Email success changed!

      <button @click="isSuccess = false">
        close
      </button>
    </div>

    <div>
      <label for="email-from">New email:</label>
      <input id="email-from" v-model="email" type="email" placeholder="email">
    </div>

    <button :disabled="isLoading" @click="changeEmail">
      Change email
    </button>
  </div>
</template>
