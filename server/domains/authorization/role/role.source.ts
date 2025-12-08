import type { Role } from '#database'
import { EntitySource } from '#classes/EntitySource'
import { roleRepository } from './role.repository'

class RoleSource extends EntitySource<Role> {
  readonly scope = 'roles'

  get keys() {
    return {
      list: `${this.scope}:list`,
      one: (name: string) => `${this.scope}:name:${name}`,
      permissions: (name: string) => `${this.scope}:name:${name}:permissions`,
    }
  }

  get tags() {
    return {
      one: (name: string) => `${this.scope}:tags:${name}`,
    }
  }

  getEntityKeys(role: Role): string[] {
    return [
      this.keys.list,
      this.keys.one(role.name),
      this.keys.permissions(role.name),
    ]
  }

  getEntityTags(role: Role): string[] {
    return [
      this.tags.one(role.name),
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
   * @throws ROLE_NOT_FOUND
   * @returns The role instance
   */
  async getByPk(name: string) {
    const key = this.keys.one(name)

    return await useDatabaseCache(key, async () => {
      const data = await roleRepository.findByPk(name)

      if (!data) {
        throw createAppError('ROLE_NOT_FOUND')
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
}

export const roleSource = new RoleSource()
