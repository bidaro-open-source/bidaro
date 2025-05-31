<script setup lang="ts">
const { $api } = useNuxtApp()

const auth = useAuthStore()

const state = reactive({
  email: '',
})

const error = ref<unknown | null>(null)
const isError = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)

async function onSubmit() {
  try {
    error.value = null
    isError.value = false
    isLoading.value = true

    await $api.profileRecovery.sendRecoveryRequest({
      body: { email: state.email },
    })

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
  <div>
    <h1 class="font-bold text-2xl text-center">
      Відновити пароль
    </h1>

    <UForm
      v-if="!isSuccess"
      :state="state"
      :disabled="auth.isAuthenticating"
      class="space-y-4 mt-4"
      @submit="onSubmit"
    >
      <UFormField label="Пошта" name="email">
        <UInput v-model="state.email" class="w-full" />
      </UFormField>

      <UButton
        color="neutral"
        variant="soft"
        type="submit"
      >
        Відновити
      </UButton>
    </UForm>

    <div v-else>
      Ми надіслали на цю пошту посилання, за яким ви можете скинути пароль.
    </div>

    <ErrorHandler v-if="isError" :error="error" class="mt-4" />
  </div>
</template>
