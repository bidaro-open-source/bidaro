<script setup lang="ts">
const props = defineProps<{
  id: string
}>()

const auth = useAuthStore()

const items = ref([
  { label: '1 година', value: '1_hour' },
  { label: '1 день', value: '1_day' },
  { label: '3 дня', value: '3_days' },
  { label: '7 днів', value: '7_days' },
])

const error = ref<unknown | null>(null)
const isError = ref(false)
const state = reactive({
  title: '',
  description: '',
  duration: '1_day' as const,
  immediatelyPublish: false,
  hideImmediatelyPublish: false,
})

async function onSubmit() {
  try {
    error.value = null
    isError.value = false

    const { $api } = useNuxtApp()

    await $api.lots.updateLot({
      params: { id: +props.id },
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

onMounted(async () => {
  try {
    isError.value = false

    const { $api } = useNuxtApp()

    const data = await $api.lots.fetchLot({
      params: { id: +props.id },
    })

    state.title = data.title
    state.description = data.description || ''
    state.duration = data.duration as any
    state.immediatelyPublish = data.status === 'draft'
    state.hideImmediatelyPublish = data.status !== 'draft'
  }
  catch (err: unknown) {
    isError.value = true
    // @ts-expect-error data exists
    error.value = err?.data
  }
})
</script>

<template>
  <div>
    <h1 class="font-bold text-2xl text-center">
      Редагувати лот
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

      <UFormField v-if="!state.hideImmediatelyPublish" name="immediatelyPublish">
        <UCheckbox v-model="state.immediatelyPublish" label="Опублікувати відразу" />
      </UFormField>

      <UButton
        color="neutral"
        variant="soft"
        type="submit"
      >
        Оновити
      </UButton>
    </UForm>

    <ErrorHandler v-if="isError" :error="error" class="mt-4" />
  </div>
</template>
