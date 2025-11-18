import type { InternalApi } from 'nitropack/types'
import type { FetchOptions } from 'ofetch'
import { url } from '@nuxt/test-utils/e2e'
import { ofetch } from 'ofetch'

type InternalApiEndpoints = keyof InternalApi | (string & {})
type ExtendedFetchOptions = FetchOptions & {
  accessToken?: string
}

declare module 'ofetch' {
  interface FetchOptions {
    accessToken?: string
  }
}

const myFetch = ofetch.create({
  ignoreResponseError: true,
  onRequest(context) {
    if (context.options.accessToken) {
      context.options.headers.set(
        'Authorization',
        `Bearer ${context.options.accessToken}`,
      )
    }
  },
})

export function fetch(request: InternalApiEndpoints, fetchOptions: ExtendedFetchOptions) {
  return myFetch.raw(url(request), fetchOptions)
}
