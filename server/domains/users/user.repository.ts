import type { RepositoryOptions } from '#class/BaseRepository'
import type { User } from '#database'
import { BaseRepository } from '#class/BaseRepository'

class UserRepository extends BaseRepository<User> {
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

  /**
   * Finds a user by their primary key, including their role and permissions.
   *
   * @param pk - user primary key
   * @param options - sequelize options
   * @returns user or null if not found
   */
  async findByPkWithAuth(pk: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return db.User.findByPk(pk, {
      transaction: options.transaction,
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
            },
          ],
        },
      ],
    })
  }
}

export const userRepository = new UserRepository()
