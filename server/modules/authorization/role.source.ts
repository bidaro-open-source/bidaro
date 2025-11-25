import type { Role } from '../../database'
import type { SourceInvalidateParams } from '../../types/sources'
import { roleRepository } from './role.repository'

const SCOPE = 'roles'

const keys = {
  all: `${SCOPE}:*`,
  roles: `${SCOPE}:list`,
  one: (name: string) => `${SCOPE}:name:${name}`,
  permissions: (name: string) => `${SCOPE}:name:${name}:permissions`,
}

export const roleSource = {
  /**
   * Retrieve all roles, using Redis caching.
   *
   * @returns Array of role instances
   */
  async getAll() {
    const db = useDatabase()
    const key = keys.roles

    return await useDatabaseCache(key, db.Role, async () => {
      return await roleRepository.findAll()
    })
  },

  /**
   * Retrieve a role by name, using Redis caching.
   *
   * @param name - Role name
   * @throws 404 if the role does not exist
   * @returns The role instance
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
   * Retrieve permissions for a role by name, using Redis caching.
   *
   * @param name - Role name
   * @returns Array of permissions for the specified role
   */
  async getPermissionsByName(name: string) {
    const db = useDatabase()
    const key = keys.permissions(name)

    return await useDatabaseCache(key, db.Permission, async () => {
      return await roleRepository.findAllPermissionsByName(name)
    })
  },

  /**
   * Clears cache entries for one or more role instances.
   *
   * @param instance - A role instance or an array of role instances to invalidate
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
   * Invalidates all role-related cache entries.
   */
  async invalidateAll() {
    const redis = useRedis()
    const keysForDelete = await redis.keys(keys.all)
    if (keysForDelete.length > 0) {
      await redis.del(keysForDelete)
    }
  },
}
