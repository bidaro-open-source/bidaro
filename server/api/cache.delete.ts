import { lotSource } from '#domains/auction'
import { permissionSource, roleSource } from '#domains/authorization'
import { categorySource } from '#domains/categories'
import { userSource } from '#domains/users'
import { clearCachePolicy } from './cache.delete.policy'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 5,
    anonymousLimit: 0,
    duration: 60,
  })

  clearCachePolicy(event)

  await roleSource.invalidateAll()
  await permissionSource.invalidateAll()
  await categorySource.invalidateAll()
  await userSource.invalidateAll()
  await lotSource.invalidateAll()
})
