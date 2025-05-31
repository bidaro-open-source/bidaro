<script setup lang="ts">
const auth = useAuthStore()

const state = reactive({
  username: '',
  password: '',
})

const error = ref<unknown | null>(null)
const isError = ref(false)

async function onSubmit() {
  try {
    error.value = null
    isError.value = false

    await auth.login({
      username: state.username,
      password: state.password,
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
    <h1 class="font-bold text-2xl text-center">
      Увійти
    </h1>

    <UForm
      :state="state"
      :disabled="auth.isAuthenticating"
      class="space-y-4 mt-4"
      @submit="onSubmit"
    >
      <UFormField label="Логін" name="username">
        <UInput v-model="state.username" class="w-full" />
      </UFormField>

      <UFormField label="Пароль" name="password">
        <UInput v-model="state.password" type="password" class="w-full" />
      </UFormField>

      <UButton
        color="neutral"
        variant="soft"
        type="submit"
      >
        Увійти
      </UButton>
    </UForm>

    <div class="text-center mt-4">
      <UButton variant="link" href="/auth/reset-password">
        Забули пароль?
      </UButton>
    </div>

    <ErrorHandler v-if="isError" :error="error" class="mt-4" />
  </div>
</template>
