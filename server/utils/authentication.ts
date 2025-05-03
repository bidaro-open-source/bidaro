import type { Permission, Role, User } from '../database'

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
    throw createError({
      statusCode: 401,
      statusMessage: 'Необхідна авторизація',
      message: 'Для цієї дії необхідно бути в системі',
    })
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
export function getAuthenticatedUser(event: H3Event): User {
  return event.context.auth?.user as User
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
): Role | undefined {
  return event.context.auth?.user.role
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
): Permission[] | undefined {
  return event.context.auth?.user.role?.permissions
}
