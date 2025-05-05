<script setup lang="ts">
const props = defineProps<{
  token: string
}>()

const api = useApiStore()

const password = ref('')

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function logout() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    const data = await api.password.sendNewPassword({
      body: { password: password.value, token: props.token },
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
      <label for="password-from">New password:</label>
      <input
        id="password-from"
        v-model="password"
        type="password"
        placeholder="Password"
      >
    </div>

    <button :disabled="isLoading" @click="logout">
      Reset password
    </button>
  </div>
  <div v-else>
    Your password success changed! Go to
    <NuxtLink href="/auth/login">
      login
    </NuxtLink>
    page.
  </div>
</template>
