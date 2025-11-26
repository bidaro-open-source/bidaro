import type { SourceInvalidateParams } from '~~/server/class/Source'
import type { Role } from '../../../database'
import { Source } from '~~/server/class/Source'
import { roleRepository } from './role.repository'

class RoleSource extends Source<Role> {
  protected readonly scope = 'roles'

  protected get keys() {
    return {
      list: `${this.scope}:list`,
      one: (name: string) => `${this.scope}:name:${name}`,
      permissions: (name: string) => `${this.scope}:name:${name}:permissions`,
    }
  }

  protected getEntityKeys(role: Role): string[] {
    return [
      this.keys.one(role.name),
      this.keys.permissions(role.name),
    ]
  }

  /**
   * Retrieve all roles, using Redis caching.
   *
   * @returns Array of role instances
   */
  async getAll() {
    return await useDatabaseCache(this.keys.list, async () => {
      return await roleRepository.findAll()
    })
  }

  /**
   * Retrieve a role by name, using Redis caching.
   *
   * @param name - Role name
   * @throws 404 if the role does not exist
   * @returns The role instance
   */
  async getByPk(name: string) {
    const key = this.keys.one(name)

    return await useDatabaseCache(key, async () => {
      const data = await roleRepository.findByPk(name)

      if (!data) {
        throw createError({
          statusCode: 404,
          message: 'Role not found',
        })
      }

      return data
    })
  }

  /**
   * Retrieve permissions for a role by name, using Redis caching.
   *
   * @param name - Role name
   * @returns Array of permissions for the specified role
   */
  async getPermissionsByPk(name: string) {
    const key = this.keys.permissions(name)

    return await useDatabaseCache(key, async () => {
      return await roleRepository.findAllPermissionsByPk(name)
    })
  }

  override async invalidate(instance: SourceInvalidateParams<Role>) {
    const redis = useRedis()

    await redis.del(this.keys.list)

    await super.invalidate(instance)
  }
}

export const roleSource = new RoleSource()
