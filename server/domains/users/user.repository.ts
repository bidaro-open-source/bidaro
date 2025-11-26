import type { RepositoryOptions } from '~~/server/class/Repository'
import type { User } from '../../database'
import { Repository } from '~~/server/class/Repository'

class UserRepository extends Repository<User> {
  protected get model() {
    return useDatabase().User
  }

  /**
   * Finds a user by their email.
   *
   * @param email - user email
   * @param options - sequelize options
   * @returns user or null if not found
   */
  async findByEmail(email: string, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return db.User.findOne({
      transaction: options.transaction,
      where: { email },
    })
  }

  /**
   * Finds a user by their username.
   *
   * @param username - username
   * @param options - sequelize options
   * @returns user or null if not found
   */
  async findByUsername(username: string, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return db.User.findOne({
      transaction: options.transaction,
      where: { username },
    })
  }
}

export const userRepository = new UserRepository()
