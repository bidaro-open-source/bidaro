import type { Role } from '../database'
import type { SourceInvalidateParams } from '../types/sources'
import { roleRepository } from '../repositories/role.repository'

const SCOPE = 'roles'

const keys = {
  all: `${SCOPE}:*`,
  roles: `${SCOPE}:list`,
  one: (name: string) => `${SCOPE}:name:${name}`,
  permissions: (name: string) => `${SCOPE}:name:${name}:permissions`,
}

export const roleSource = {
  /**
   * Retrieves a role by ID, utilizing Redis caching.
   *
   * @throws 404 if the role does not exist
   * @returns role instance
   */
  async getAll() {
    const db = useDatabase()
    const key = keys.roles

    return await useDatabaseCache(key, db.Role, async () => {
      return await roleRepository.findAll()
    })
  },

  /**
   * Retrieves a role by ID, utilizing Redis caching.
   *
   * @throws 404 if the role does not exist
   * @returns role instance
   */
  async getByName(name: string) {
    const db = useDatabase()
    const key = keys.one(name)

    return await useDatabaseCache(key, db.Role, async () => {
      const data = await roleRepository.findByName(name)

      if (!data) {
        throw createError({
          message: 'Роль не знайдена',
          status: 404,
        })
      }

      return data
    })
  },

  /**
   * Retrieves a role by ID, utilizing Redis caching.
   *
   * @throws 404 if the role does not exist
   * @returns role instance
   */
  async getPermissionsByName(name: string) {
    const db = useDatabase()
    const key = keys.permissions(name)

    return await useDatabaseCache(key, db.Permission, async () => {
      return await roleRepository.findAllPermissionsByName(name)
    })
  },

  /**
   * Clears cache for a role.
   *
   * @param instance role instance or array of role instances
   */
  async invalidate(instance: SourceInvalidateParams<Role>) {
    const db = useDatabase()
    const redis = useRedis()
    const roles = Array.isArray(instance) ? instance : [instance]
    const keysForDelete = new Set<string>()

    keysForDelete.add(keys.roles)

    for (const role of roles) {
      if (!role || !(role instanceof db.Role))
        continue

      keysForDelete.add(keys.one(role.name))
      keysForDelete.add(keys.permissions(role.name))
    }

    await redis.del([...keysForDelete])
  },

  /**
   * Invalidates all category-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    const keysForDelete = await redis.keys(keys.all)
    if (keysForDelete.length > 0) {
      await redis.del(keysForDelete)
    }
  },
}
