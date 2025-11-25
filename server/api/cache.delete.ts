import { permissionSource, roleSource } from '../domains/authorization'
import { categorySource } from '../domains/categories'
import { lotSource } from '../domains/lots'
import { userSource } from '../domains/users'
import { clearCachePolicy } from './cache.delete.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  clearCachePolicy(event)

  await roleSource.invalidateAll()
  await permissionSource.invalidateAll()
  await categorySource.invalidateAll()
  await userSource.invalidateAll()
  await lotSource.invalidateAll()
})
