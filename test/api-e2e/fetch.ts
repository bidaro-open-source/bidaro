import type { InternalApi } from 'nitropack/types'
import type { FetchOptions } from 'ofetch'
import process from 'node:process'
import { ofetch } from 'ofetch'
import { joinURL } from 'ufo'

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

function url(path: string) {
  const host = process.env.SETUP_HOST || ''
  return path.startsWith(host) ? path : joinURL(host, path)
}

export function fetch(request: InternalApiEndpoints, fetchOptions: ExtendedFetchOptions) {
  return myFetch.raw(url(request), fetchOptions)
}
