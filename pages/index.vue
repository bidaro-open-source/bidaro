<script setup lang="ts">
const error = ref<unknown | null>(null)
const isError = ref(false)

const auth = useAuthStore()
const sessions = useSessionsStore()

const loginFormUsername = ref('test')
const loginFormPassword = ref('password')

async function fetchProfile() {
  try {
    isError.value = false
    await auth.fetchProfile()
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
}

async function fetchSessions() {
  try {
    isError.value = false
    await sessions.fetchSessions()
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
}

async function refreshToken() {
  try {
    isError.value = false
    await auth.refresh()
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
}

async function logout() {
  try {
    isError.value = false
    await auth.logout()
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
}

async function login() {
  try {
    isError.value = false
    await auth.login({
      username: loginFormUsername.value,
      password: loginFormPassword.value,
    })
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
}

async function deleteSessions(uuid: string) {
  try {
    isError.value = false
    await sessions.deleteSessions(uuid)
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
}
</script>

<template>
  <div>
    <div>User authed: {{ auth.isAuthenticated }}</div>

    <div v-if="auth.isAuthenticated">
      <div>Auth access token: {{ auth.accessToken }}</div>
      <div>Auth session token: {{ auth.sessionUuid }}</div>

      <ul>
        <li>User name: {{ auth.user?.username }}</li>
        <li>Email: {{ auth.user?.email }}</li>
        <li>
          Role: {{ auth.user?.role?.displayName
            ? auth.user?.role?.displayName : auth.user?.role?.name }}
        </li>
        <li>
          Permission:

          <ul>
            <li
              v-for="permission in auth.user?.permissions"
              :key="permission.name"
            >
              {{ permission.displayName
                ? permission.displayName : permission.name }}
            </li>
          </ul>
        </li>
      </ul>

      <div>Sessions:</div>

      <ul>
        <li v-for="session in sessions.sessions" :key="session.uuid">
          {{ session.uuid }}
          <button @click="deleteSessions(session.uuid)">
            X
          </button>
        </li>
      </ul>

      <button @click="fetchProfile">
        Refetch profile
      </button>
      <button @click="fetchSessions">
        Fetch sessions
      </button>
      <button @click="refreshToken">
        Refresh
      </button>
      <button @click="logout">
        Logout
      </button>
    </div>

    <div v-else>
      <input v-model="loginFormUsername" type="text">
      <input v-model="loginFormPassword" type="text">
      <button @click="login">
        Login
      </button>
    </div>

    <div v-if="auth.isRefreshing">
      LOADING...
    </div>

    <ErrorHanlder v-if="isError" :error="error" />
  </div>
</template>
