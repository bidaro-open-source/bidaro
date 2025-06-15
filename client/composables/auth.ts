import type { FetchContext } from 'ofetch'

/**
 * Initialize fetch user access token at mount.
 */
export async function useAuthInitialize() {
  const auth = useAuthStore()
  await auth.refresh()
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
  const { $api } = useNuxtApp()

  async function onResponseErrorHandler(ctx: FetchContext) {
    if (
      ctx.response
      && ctx.response.status === 401
      && ctx.request !== '/api/auth/refresh'
    ) {
      return auth.refresh()
    }

    return Promise.reject(ctx.response?._data)
  }

  onBeforeMount(() => {
    $api.addInterceptor('onResponseError', onResponseErrorHandler)
  })

  onUnmounted(() => {
    $api.removeInterceptor('onResponseError', onResponseErrorHandler)
  })
}

/**
 * Automatically set the access token in the request headers
 * if the user is authenticated and the request is not to refresh it.
 */
export function useAuthHeadersRequestFeature() {
  const auth = useAuthStore()
  const { $api } = useNuxtApp()

  function onRequestHanlder(ctx: FetchContext) {
    if (ctx.request !== '/api/auth/refresh' && auth.isAuthenticated) {
      ctx.options.headers.set(
        'Authorization',
        `Bearer ${auth.accessToken}`,
      )
    }
  }

  onBeforeMount(() => {
    $api.addInterceptor('onRequest', onRequestHanlder)
  })

  onUnmounted(() => {
    $api.removeInterceptor('onRequest', onRequestHanlder)
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

/**
 * Automatically syncing the auth store state between browser tabs
 * by Broadcast Channel.
 */
export function useAuthMultitabsFeature() {
  const auth = useAuthStore()
  const broadcast = useBroadcast(auth.$id)

  const { onMessage, setEmmiter, unsetEmmiter } = auth.useSynchronize()

  const onBroadcastMessage = (event: MessageEvent) => onMessage(event.data)

  onBeforeMount(() => {
    setEmmiter((data: string) => broadcast.postMessage(data))
    broadcast.addEventListener('message', onBroadcastMessage)
  })

  onUnmounted(() => {
    unsetEmmiter()
    broadcast.removeEventListener('message', onBroadcastMessage)
  })
}

/**
 * Defines access restrictions for pages based on authentication status.
 *
 * This function sets up a watcher that automatically redirects users based
 * on their authentication state and the specified restriction type:
 *
 * @param type - The type of restriction to apply
 *   - 'auth': Page requires authenticated user
 *   - 'guest': Page requires unauthenticated user
 *
 * @example
 * // Protect a page that requires authentication
 * definePageRestrictions('auth')
 */
export function definePageRestrictions(type: 'auth' | 'guest') {
  const auth = useAuthStore()

  watch(
    () => ({
      isAuthenticating: auth.isAuthenticating,
      isAuthenticated: auth.isAuthenticated,
    }),
    ({ isAuthenticated, isAuthenticating }) => {
      switch (type) {
        case 'auth':
          if (!isAuthenticating && !isAuthenticated)
            navigateTo('/auth/login')
          break
        case 'guest':
          if (!isAuthenticating && isAuthenticated)
            navigateTo('/profile')
          break
      }
    },
    { immediate: true },
  )
}
