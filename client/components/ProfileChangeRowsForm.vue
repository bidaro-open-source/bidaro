<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuthStore()

const name = ref('')
const surname = ref('')

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function changeEmail() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    const data = await $api.profile.updateProfile({
      body: { name: name.value, surname: surname.value },
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
      Your profile has been updated!

      <button @click="isSuccess = false">
        close
      </button>
    </div>

    <div>
      <label for="name-from">Name:</label>
      <input id="name-from" v-model="name" type="text" placeholder="Name">
    </div>

    <div>
      <label for="surname-from">Surname:</label>
      <input
        id="surname-from" v-model="surname" type="text" placeholder="Surname"
      >
    </div>

    <button :disabled="isLoading" @click="changeEmail">
      Update info
    </button>
  </div>
</template>
