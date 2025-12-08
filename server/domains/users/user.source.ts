import type { User } from '#database'
import { EntitySource } from '#classes/EntitySource'
import { userRepository } from './user.repository'

class UserSource extends EntitySource<User> {
  readonly scope = 'users'

  get keys() {
    return {
      one: (id: number) => `${this.scope}:id:${id}`,
      oneAuth: (id: number) => `${this.scope}:auth:${id}`,
      tag: (id: number) => `${this.scope}:tags:${id}`,
    }
  }

  getEntityKeys(user: User): string[] {
    return [
      this.keys.one(user.id),
      this.keys.oneAuth(user.id),
    ]
  }

  getEntityTags(user: User): string[] {
    return [
      this.keys.tag(user.id),
    ]
  }

  /**
   * Retrieve a user by ID, using Redis caching.
   *
   * @param id - User primary key
   * @throws USER_NOT_FOUND
   * @returns The user instance
   */
  async getByPk(id: number) {
    const key = this.keys.one(id)

    return await useDatabaseCache(key, async () => {
      const data = await userRepository.findByPk(id)

      if (!data) {
        throw createAppError('USER_NOT_FOUND', { userId: id })
      }

      return data
    })
  }

  /**
   * Retrieve a user auth data by ID, using Redis caching.
   *
   * @param id - User primary key
   * @throws USER_NOT_FOUND
   * @returns User authentication data including role and permissions
   */
  async getByPkWithAuth(id: number) {
    const key = this.keys.oneAuth(id)

    return await useDatabaseCache(key, async () => {
      const data = await userRepository.findByPkWithAuth(id)

      if (!data) {
        throw createAppError('USER_NOT_FOUND', { userId: id })
      }

      return {
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role
          ? {
              name: data.role.name,
              permissions: (data.role.permissions || []).map(p => p.name),
            }
          : null,
      }
    })
  }
}

export const userSource = new UserSource()
