export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server)
    return

  const auth = useAuthStore()

  if (!auth.isAuthenticating && !auth.isAuthenticated) {
    return abortNavigation()
  }
})
