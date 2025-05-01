<script setup lang="ts">
const auth = useAuthStore()
const profile = useProfileStore()

const loginFormUsername = ref('test')
const loginFormPassword = ref('password')
</script>

<template>
  <div>
    <div>User authed: {{ auth.isAuthenticated }}</div>

    <div v-if="auth.isAuthenticated">
      <div>Auth access token: {{ auth.accessToken }}</div>
      <div>Auth session token: {{ auth.sessionUuid }}</div>

      <ul>
        <li>User name: {{ profile.user?.username }}</li>
        <li>Email: {{ profile.user?.email }}</li>
        <li>Role: {{ profile.role }}</li>
        <li>
          Permission:

          <ul>
            <li
              v-for="permission in profile.permissions" :key="permission.name"
            >
              {{ permission.displayName
                ? permission.displayName : permission.name }}
            </li>
          </ul>
        </li>
      </ul>

      <button @click="profile.fetchProfile">
        Refetch profile
      </button>
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

    <div v-if="auth.isError">
      Auth error: {{ auth.error }}
    </div>

    <div v-if="profile.isError">
      Profile error: {{ profile.error }}
    </div>

    <div v-if="auth.isAuthenticating || auth.isLogouting || auth.isRefreshing">
      LOADING...
    </div>
  </div>
</template>
