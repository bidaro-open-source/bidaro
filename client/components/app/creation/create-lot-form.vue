<script setup lang="ts">
const auth = useAuthStore()

const items = ref([
  { label: '1 година', value: '1_hour' },
  { label: '1 день', value: '1_day' },
  { label: '3 дня', value: '3_days' },
  { label: '7 днів', value: '7_days' },
])

const state = reactive({
  title: '',
  description: '',
  duration: '1_day' as const,
  immediatelyPublish: false,
})

const error = ref<unknown | null>(null)
const isError = ref(false)

async function onSubmit() {
  try {
    const { $api } = useNuxtApp()
    error.value = null
    isError.value = false

    await $api.lots.createLot({
      body: {
        title: state.title,
        description: state.description,
        duration: state.duration,
        immediatelyPublish: state.immediatelyPublish,
      },
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
      Створити лот
    </h1>

    <UForm
      :state="state"
      :disabled="auth.isAuthenticating"
      class="space-y-4 mt-4"
      @submit="onSubmit"
    >
      <UFormField label="Заголовок" name="title">
        <UInput v-model="state.title" class="w-full" />
      </UFormField>

      <UFormField label="Опис" name="description">
        <UTextarea v-model="state.description" class="w-full" />
      </UFormField>

      <UFormField label="Час" name="duration">
        <USelect v-model="state.duration" :items="items" class="w-48" />
      </UFormField>

      <UFormField name="immediatelyPublish">
        <UCheckbox v-model="state.immediatelyPublish" label="Опублікувати відразу" />
      </UFormField>

      <UButton
        color="neutral"
        variant="soft"
        type="submit"
      >
        Створити лот
      </UButton>
    </UForm>

    <ErrorHandler v-if="isError" :error="error" class="mt-4" />
  </div>
</template>
