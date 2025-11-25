import { categorySource } from '../sources/category.source'
import { lotSource } from '../sources/lot.source'
import { permissionSource } from '../sources/permission.source'
import { roleSource } from '../sources/role.source'
import { userSource } from '../sources/user.source'
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
