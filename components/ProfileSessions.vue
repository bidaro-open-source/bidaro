<script setup lang="ts">
const auth = useAuthStore()
const sessions = useSessionsStore()

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)

async function fetchSessions() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    await sessions.fetchSessions()
  }
  catch (err) {
    error.value = err
    isError.value = true
  }
  finally {
    isLoading.value = false
  }
}

async function deleteSessions(uuid: string) {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    await sessions.deleteSessions(uuid)
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

    <div>
      <b>Sessions:</b>
      {{ sessions.sessions.length ? '' : 'not loaded' }}
    </div>

    <ul>
      <li v-for="session in sessions.sessions" :key="session.uuid">
        <b>{{ session.uuid }}</b>

        <ul>
          <li v-if="session.date">
            <b>Date:</b>
            {{
              session.date ? new Date(session.date).toDateString() : 'no info'
            }}
          </li>
          <li v-if="session.ua">
            <b>User Agent:</b> {{ session.ua ? session.ua : 'not info' }}
          </li>
          <li>
            <button @click="deleteSessions(session.uuid)">
              Delete
            </button>
          </li>
        </ul>
      </li>
    </ul>

    <div>
      <button :disabled="isLoading" @click="fetchSessions">
        Fetch Sessions
      </button>
    </div>
  </div>
</template>
