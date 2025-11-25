import type { User } from '../../database'
import { Source } from '~~/server/class/Source'
import { userRepository } from './user.repository'

class UserSource extends Source<User> {
  protected scope = 'users'

  protected get keys() {
    return {
      ...super.keys,
      one: (id: number) => `${this.scope}:id:${id}`,
    }
  }

  protected getEntityKeys(user: User): string[] {
    return [
      this.keys.one(user.id),
    ]
  }

  /**
   * Retrieve a user by ID, using Redis caching.
   *
   * @param id - User primary key
   * @throws 404 if the user does not exist
   * @returns The user instance
   */
  async getByPk(id: number) {
    const db = useDatabase()
    const key = this.keys.one(id)

    return await useDatabaseCache(key, db.User, async () => {
      const data = await userRepository.findByPk(id)

      if (!data) {
        throw createError({
          message: 'Користувача не знайдено',
          status: 404,
        })
      }

      return data
    })
  }
}

export const userSource = new UserSource()
