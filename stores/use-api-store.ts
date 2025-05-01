import { defineStore } from 'pinia'
import { createAuthApi } from '~/api/auth-api'

export const useApiStore = defineStore('api', () => {
  const auth = ref(createAuthApi(useApi))
  return { auth }
})
