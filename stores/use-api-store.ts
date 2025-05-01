import type { FetchHook, FetchHooks, FetchOptions } from 'ofetch'
import { defineStore, skipHydrate } from 'pinia'
import { createAuthApi } from '~/api/auth-api'
import { createProfileApi } from '~/api/profile-api'

type Interceptors = keyof FetchHooks

function assertIsFetchHook(
  value: unknown,
): asserts value is FetchHook {
  if (typeof value !== 'function') {
    throw new TypeError(`Interceptor must be a function`)
  }
}

function assertInterceptorExists<T extends string>(
  interceptors: Record<T, unknown>,
  interceptor: string,
): asserts interceptor is T {
  if (!(interceptor in interceptors)) {
    throw new Error(`Interceptor ${interceptor} is not supported`)
  }
}

export const useApiStore = defineStore('api', () => {
  const interceptors = ref({
    onResponse: [] as FetchHook[],
    onResponseError: [] as FetchHook[],
    onRequest: [] as FetchHook[],
    onRequestError: [] as FetchHook[],
  })

  function addInterceptor<T extends Interceptors>(
    interceptor: T,
    callback: FetchHooks[T],
  ) {
    assertIsFetchHook(callback)
    assertInterceptorExists(interceptors.value, interceptor)

    const index = interceptors.value[interceptor].indexOf(callback)

    if (index !== -1)
      throw new Error(`Interceptor ${interceptor} already exists`)

    interceptors.value[interceptor].push(callback)
  }

  function removeInterceptor<T extends Interceptors>(
    interceptor: T,
    callback: FetchOptions[T],
  ) {
    assertIsFetchHook(callback)
    assertInterceptorExists(interceptors.value, interceptor)

    const index = interceptors.value[interceptor].indexOf(callback)

    if (index === -1)
      throw new Error(`Interceptor ${interceptor} not found`)

    interceptors.value[interceptor].splice(index, 1)
  }

  const useApi = $fetch.create({
    retry: 2,
    retryStatusCodes: [401],
    onResponse: interceptors.value.onResponse,
    onResponseError: interceptors.value.onResponseError,
    onRequest: interceptors.value.onRequest,
    onRequestError: interceptors.value.onRequestError,
  })

  const auth = ref(createAuthApi(useApi))
  const profile = ref(createProfileApi(useApi))

  return {
    auth: skipHydrate(auth),
    profile: skipHydrate(profile),
    interceptors: skipHydrate(interceptors),
    useApi,
    addInterceptor,
    removeInterceptor,
  }
})
