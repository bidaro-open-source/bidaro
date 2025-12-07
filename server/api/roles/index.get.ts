import { createRoleResource, roleSource } from '#domains/authorization'
import { viewRolesPolicy } from './index.policy'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 60,
    anonymousLimit: 0,
    duration: 60,
  })

  viewRolesPolicy(event)

  const roles = await roleSource.getAll()

  return roles.map(createRoleResource)
})
