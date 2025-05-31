<script setup lang="ts">
const props = defineProps<{
  token: string
}>()

const { $api } = useNuxtApp()

const auth = useAuthStore()

const state = reactive({
  password: '',
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

    await $api.profileRecovery.confirmRecoveryRequest({
      body: { password: state.password, token: props.token },
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
      Встановити пароль
    </h1>

    <UForm
      v-if="!isSuccess"
      :state="state"
      :disabled="auth.isAuthenticating"
      class="space-y-4 mt-4"
      @submit="onSubmit"
    >
      <UFormField label="Новий пароль" name="password">
        <UInput v-model="state.password" type="password" class="w-full" />
      </UFormField>

      <UButton
        color="neutral"
        variant="soft"
        type="submit"
      >
        Скинути
      </UButton>
    </UForm>

    <div v-else>
      Ваш пароль було успішно змінено. Перейдіть на сторінку
      <NuxtLink class="underline" href="/auth/login">
        входу
      </NuxtLink>, щоб увійти до свого акаунта за допомогою нового
      пароя
    </div>

    <ErrorHandler v-if="isError" :error="error" class="mt-4" />
  </div>
</template>
