import type { FetchHook, FetchOptions } from 'ofetch'

type Interceptors = keyof typeof interceptors

const interceptors = {
  onResponse: [] as FetchOptions['onResponse'],
  onResponseError: [] as FetchOptions['onResponseError'],
  onRequest: [] as FetchOptions['onRequest'],
  onRequestError: [] as FetchOptions['onRequestError'],
}

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

function assertInterceptorStoreIsArray(
  interceptorArray: unknown | unknown[],
): asserts interceptorArray is unknown[] {
  if (!Array.isArray(interceptorArray)) {
    throw new TypeError(`Interceptor store is not an array`)
  }
}

function addInterceptor<T extends Interceptors>(
  interceptor: T,
  callback: FetchOptions[T],
) {
  assertIsFetchHook(callback)
  assertInterceptorExists(interceptors, interceptor)
  assertInterceptorStoreIsArray(interceptors[interceptor])

  const index = interceptors[interceptor].indexOf(callback)

  if (index !== -1) {
    throw new Error(`Interceptor ${interceptor} already exists`)
  }

  interceptors[interceptor].push(callback)
}

function removeInterceptor<T extends Interceptors>(
  interceptor: T,
  callback: FetchOptions[T],
) {
  assertIsFetchHook(callback)
  assertInterceptorExists(interceptors, interceptor)
  assertInterceptorStoreIsArray(interceptors[interceptor])

  const index = interceptors[interceptor].indexOf(callback)

  if (index === -1) {
    throw new Error(`Interceptor ${interceptor} not found`)
  }

  interceptors[interceptor].splice(index, 1)
}

export const useApi = $fetch.create({
  retry: 2,
  retryStatusCodes: [401],
  onResponse: interceptors.onResponse,
  onResponseError: interceptors.onResponseError,
  onRequest: interceptors.onRequest,
  onRequestError: interceptors.onRequestError,
})

export function useApiInterceptor() {
  return {
    addInterceptor,
    removeInterceptor,
  }
}
