<script setup lang="ts">
const auth = useAuthStore()

const username = ref('test')
const password = ref('password')

const error = ref<unknown | null>(null)
const isError = ref(false)

async function login() {
  try {
    error.value = null
    isError.value = false

    await auth.login({
      username: username.value,
      password: password.value,
    })
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
}
</script>

<template>
  <div>
    <ErrorHanlder v-if="isError" :error="error" />

    <div>
      <label for="login-from">Username:</label>
      <input id="login-from" v-model="username" type="text">
    </div>

    <div>
      <label for="password-from">Password:</label>
      <input id="password-from" v-model="password" type="text">
    </div>

    <button :disabled="auth.isAuthenticating" @click="login">
      Login
    </button>
  </div>
</template>
