<script setup lang="ts">
const { $api } = useNuxtApp()
const auth = useAuthStore()

const state = reactive({
  name: '',
  surname: '',
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

    const data = await $api.profile.updateProfile({
      body: { name: state.name, surname: state.surname },
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

    <h2 class="font-bold text-2xl">
      Змінити особисті дані
    </h2>

    <UAlert
      v-if="isSuccess"
      color="success"
      variant="subtle"
      title="Успішно"
      description="Ваші особисті дані було оновлено"
      class="w-full mt-4"
      close
      @update:open="isSuccess = false"
    />

    <UForm
      :state="state"
      :disabled="isLoading"
      class="flex gap-4 mt-4 items-end"
      @submit="onSubmit"
    >
      <UFormField label="Ім'я" name="username">
        <UInput v-model="state.name" />
      </UFormField>

      <UFormField label="Прізвище" name="username">
        <UInput v-model="state.surname" />
      </UFormField>

      <UButton color="neutral" variant="soft" type="submit">
        Змінити
      </UButton>
    </UForm>
  </div>
</template>
