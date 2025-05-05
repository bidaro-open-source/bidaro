import type { FetchHook, FetchHooks, FetchOptions } from 'ofetch'
import { createAuthApi } from '~/api/auth-api'
import { createPasswordResetApi } from '~/api/password-reset-api'
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

export default defineNuxtPlugin(() => {
  const interceptors = {
    onResponse: [] as FetchHook[],
    onResponseError: [] as FetchHook[],
    onRequest: [] as FetchHook[],
    onRequestError: [] as FetchHook[],
  }

  function addInterceptor<T extends Interceptors>(
    interceptor: T,
    callback: FetchHooks[T],
  ) {
    assertIsFetchHook(callback)
    assertInterceptorExists(interceptors, interceptor)

    const index = interceptors[interceptor].indexOf(callback)

    if (index !== -1)
      throw new Error(`Interceptor ${interceptor} already exists`)

    interceptors[interceptor].push(callback)
  }

  function removeInterceptor<T extends Interceptors>(
    interceptor: T,
    callback: FetchOptions[T],
  ) {
    assertIsFetchHook(callback)
    assertInterceptorExists(interceptors, interceptor)

    const index = interceptors[interceptor].indexOf(callback)

    if (index === -1)
      throw new Error(`Interceptor ${interceptor} not found`)

    interceptors[interceptor].splice(index, 1)
  }

  const useApi = $fetch.create({
    retry: 2,
    retryStatusCodes: [401],
    onResponse: interceptors.onResponse,
    onResponseError: interceptors.onResponseError,
    onRequest: interceptors.onRequest,
    onRequestError: interceptors.onRequestError,
  })

  const api = {
    useApi,
    addInterceptor,
    removeInterceptor,
    auth: createAuthApi(useApi),
    profile: createProfileApi(useApi),
    password: createPasswordResetApi(useApi),
  }

  return {
    provide: {
      api,
    },
  }
})
