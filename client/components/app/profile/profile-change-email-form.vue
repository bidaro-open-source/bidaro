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

    const data = await $api.profile.updateProfile({
      body: { email: state.email },
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
    <ErrorHandler v-if="isError" :error="error" />

    <h2 class="font-bold text-2xl">
      Змінити особисту потшу
    </h2>

    <UAlert
      v-if="isSuccess"
      color="success"
      variant="subtle"
      title="Успішно"
      description="Ваша пошта була оновлена"
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
      <UFormField label="Нова пошта" name="email">
        <UInput v-model="state.email" />
      </UFormField>

      <UButton color="neutral" variant="soft" type="submit">
        Змінити
      </UButton>
    </UForm>
  </div>
</template>
