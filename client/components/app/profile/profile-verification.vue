<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuthStore()

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function onSubmit() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    await $api.profileVerification.sendVerificationRequest()

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
    <ErrorHandler v-if="isError" :error="error" />

    <h2 class="font-bold text-2xl">
      Верифікувати пошту
    </h2>

    <UAlert
      v-if="isSuccess"
      color="success"
      variant="subtle"
      title="Успішно"
      description="На вашу пошту було надіслано посилання через
      яке ви можете підтвердити вашу пошту"
      class="w-full mt-4"
      close
      @update:open="isSuccess = false"
    />

    <UButton
      color="neutral"
      variant="soft"
      type="submit"
      class="mt-4"
      @click="onSubmit"
    >
      Верифікувати
    </UButton>
  </div>
</template>
