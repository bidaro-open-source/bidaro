<script setup lang="ts">
import { transformToFormError } from '~/uitls/transform-to-form-error'

const auth = useAuthStore()

const state = reactive({
  email: '',
  username: '',
  password: '',
})

const form = ref()
const error = ref<any>(null)
const isError = ref(false)

async function onSubmit() {
  try {
    error.value = null
    isError.value = false

    await auth.register({
      email: state.email,
      username: state.username,
      password: state.password,
    })
  }
  catch (err: any) {
    error.value = err
    isError.value = true

    if (err.data && err.data.fieldErrors) {
      form.value.setErrors(transformToFormError(err.data.fieldErrors))
    }
  }
}
</script>

<template>
  <div>
    <h1 class="font-bold text-2xl text-center">
      Зареєструватися
    </h1>

    <UForm
      ref="form"
      :state="state"
      :disabled="auth.isAuthenticating"
      class="space-y-4 mt-4"
      @submit="onSubmit"
    >
      <UFormField label="Пошта" name="email">
        <UInput v-model="state.email" class="w-full" />
      </UFormField>
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
        Створити аккаунт
      </UButton>
    </UForm>

    <ErrorHandler v-if="isError && error && error.statusCode !== 422" :error="error" class="mt-4" />
  </div>
</template>
