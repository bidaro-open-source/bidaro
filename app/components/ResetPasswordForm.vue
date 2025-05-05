<script setup lang="ts">
const api = useApiStore()

const email = ref('')

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function logout() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    const data = await api.password.sendConfirmRequest({
      body: { email: email.value },
    })

    isSuccess.value = data.ok
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
  <div v-if="!isSuccess">
    <ErrorHanlder v-if="isError" :error="error" />

    <div>
      <label for="email-from">Email:</label>
      <input id="email-from" v-model="email" type="email" placeholder="email">
    </div>

    <button :disabled="isLoading" @click="logout">
      Send reset link
    </button>
  </div>
  <div v-else>
    Success! We send link to reset your password on this email.
  </div>
</template>
