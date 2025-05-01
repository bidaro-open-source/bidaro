<script setup lang="ts">
const auth = useAuthStore()

const loginFormUsername = ref('test')
const loginFormPassword = ref('password')
</script>

<template>
  <div>
    <div>User authed: {{ auth.isAuthenticated }}</div>

    <div v-if="auth.isAuthenticated">
      <div>Auth access token: {{ auth.accessToken }}</div>
      <div>Auth session token: {{ auth.sessionUuid }}</div>

      <button @click="auth.refresh">
        Refresh
      </button>
      <button @click="auth.logout">
        Logout
      </button>
    </div>

    <div v-else>
      <input v-model="loginFormUsername" type="text">
      <input v-model="loginFormPassword" type="text">
      <button
        @click="auth.login({
          username: loginFormUsername, password: loginFormPassword })"
      >
        Login
      </button>
    </div>

    <div v-if="auth.isAuthenticating || auth.isLogouting || auth.isRefreshing">
      LOADING...
    </div>
  </div>
</template>
