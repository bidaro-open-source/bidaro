import { AppError } from '#classes/app-error'

/**
 * Validates that the current request is authenticated with a
 * valid user session.
 *
 * Depends on the `authentication` middleware.
 *
 * @param event H3Event
 * @throws 401 Unauthorized
 *
 * @example
 * // Usage in protected route handler
 * export default defineEventHandler((event) => {
 *   mustBeAuthenticated(event)
 *   // Continue handling authenticated request
 *   return { data: 'Protected resource' }
 * })
 */
export function mustBeAuthenticated(event: H3Event): void {
  if (!event.context.auth || !event.context.auth.user) {
    throw new AppError('AUTHENTICATION_REQUIRED')
  }
}

/**
 * Returns the authenticated user.
 *
 * Must be used only after `mustBeAuthenticated` function,
 * otherwise it may return `undefined`.
 *
 * @param event H3Event
 */
export function getAuthenticatedUser(event: H3Event) {
  return event.context.auth?.user as NonNullable<typeof event.context.auth>['user']
}

/**
 * Returns the authenticated user role.
 *
 * Must be used only after `mustBeAuthenticated` function,
 * otherwise it may return `undefined` because the request itself
 * is not authenticated.
 *
 * @param event H3Event
 */
export function getAuthenticatedUserRole(
  event: H3Event,
): string | undefined {
  return event.context.auth?.user.role?.name
}

/**
 * Returns the authenticated user permissions.
 *
 * Must be used only after `mustBeAuthenticated` function,
 * otherwise it may return `undefined` because the request itself
 * is not authenticated.
 *
 * @param event H3Event
 */
export function getAuthenticatedUserPermissions(
  event: H3Event,
): string[] | undefined {
  return event.context.auth?.user.role?.permissions
}
