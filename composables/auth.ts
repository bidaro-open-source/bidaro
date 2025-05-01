import type { FetchContext } from 'ofetch'

/**
 * Initialize fetch user access token at mount.
 */
export function useAuthInitialize() {
  const auth = useAuthStore()
  onMounted(auth.refresh)
}

/**
 * Automatically refresh the access token when some request
 * fails with a 401.
 *
 * Don't retry the failed request, it do ofetch automatically.
 * Don't refresh the access token if the request is to refresh it.
 */
export function useAuthRepeatReqestFeature() {
  const auth = useAuthStore()
  const { addInterceptor, removeInterceptor } = useApiInterceptor()

  async function onResponseErrorHanlder(ctx: FetchContext) {
    if (
      ctx.response
      && ctx.response.status === 401
      && ctx.request !== '/api/auth/refresh'
    ) {
      return auth.refresh()
    }

    return Promise.reject(ctx)
  }

  onMounted(() => {
    addInterceptor('onResponseError', onResponseErrorHanlder)
  })

  onUnmounted(() => {
    removeInterceptor('onResponseError', onResponseErrorHanlder)
  })
}

/**
 * Automatically set the access token in the request headers
 * if the user is authenticated and the request is not to refresh it.
 */
export function useAuthHeadersRequestFeature() {
  const auth = useAuthStore()
  const { addInterceptor, removeInterceptor } = useApiInterceptor()

  function onRequestHanlder(ctx: FetchContext) {
    if (ctx.request !== '/api/auth/refresh' && auth.isAuthenticated) {
      ctx.options.headers.set(
        'Authorization',
        `Bearer ${auth.accessToken}`,
      )
    }
  }

  onMounted(() => {
    addInterceptor('onRequest', onRequestHanlder)
  })

  onUnmounted(() => {
    removeInterceptor('onRequest', onRequestHanlder)
  })
}

/**
 * Automatically refresh the access token when it is about to expire.
 */
export function useAuthAutorefreshFeature() {
  const auth = useAuthStore()

  useInterval(() => {
    if (auth.isTokenExpiring)
      auth.refresh()
  }, 30000)
}
