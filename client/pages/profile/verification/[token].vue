<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const error = useState<unknown | null>('error', () => null)
const isError = useState('is-error', () => false)
const isSuccess = useState('is-success', () => false)

await callOnce(async () => {
  try {
    isError.value = false

    const { $api } = useNuxtApp()

    const route = useRoute()

    const token = Array.isArray(route.params.token)
      ? route.params.token[0]
      : route.params.token

    await $api.profileVerification.confrimVerificationRequest({
      body: { token: token || '' },
    })

    isSuccess.value = true
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
    <div v-if="isSuccess">
      Вашу пошту було верефіковано!
    </div>

    <div v-if="isError">
      <ErrorHandler :error="error" />
    </div>
  </div>
</template>
