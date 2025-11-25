import { permissionSource, roleSource } from '../modules/authorization'
import { categorySource } from '../modules/categories'
import { lotSource } from '../modules/lots'
import { userSource } from '../modules/users'
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
