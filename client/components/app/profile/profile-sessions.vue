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

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div v-if="auth.isAuthenticated">
    <ErrorHandler v-if="isError" :error="error" />

    <h1 class="font-bold text-3xl">
      Активні сесії
    </h1>

    <div class="flex flex-col gap-4 mt-6">
      <ProfileSessionCard
        v-for="session in sessions.sessions"
        :key="session.uuid"
        :uuid="session.uuid"
        :date="session.date"
        :ua="session.ua"
        @delete="deleteSessions"
      />
    </div>
  </div>
</template>
