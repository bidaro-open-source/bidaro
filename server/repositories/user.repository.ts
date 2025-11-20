import type { Transaction } from 'sequelize'
import type { User, UserAttributesOptional } from '../database'

interface Options {
  transaction?: Transaction
}

export const userRepository = {
  /**
   * Finds a user by their primary key.
   *
   * @param id - user primary key
   * @param options - sequelize options
   * @returns user or null if not found
   */
  async findById(id: number, options: Options = {}) {
    const db = useDatabase()

    return db.User.findByPk(id, {
      transaction: options.transaction,
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds a user by their email.
   *
   * @param email - user email
   * @param options - sequelize options
   * @returns user or null if not found
   */
  async findByEmail(email: string, options: Options = {}) {
    const db = useDatabase()

    return db.User.findOne({
      transaction: options.transaction,
      where: { email },
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })
  },

  /**
   * Finds a user by their username.
   *
   * @param username - username
   * @param options - sequelize options
   * @returns user or null if not found
   */
  async findByUsername(username: string, options: Options = {}) {
    const db = useDatabase()

    return db.User.findOne({
      transaction: options.transaction,
      where: { username },
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })
  },

  /**
   * Creates a new user record in the database.
   *
   * @param fields - user attributes
   * @param options - sequelize options
   * @returns user instance
   */
  async create(fields: UserAttributesOptional, options: Options = {}) {
    const db = useDatabase()

    return db.User.create(
      fields,
      { transaction: options.transaction },
    )
  },

  /**
   * Save a chagned user record in the database.
   *
   * @param user - user instance
   * @param options - sequelize options
   * @returns lot instance
   */
  async save(user: User, options: Options = {}) {
    return await user.save({ transaction: options.transaction })
  },

  /**
   * Destroys a user record in the database.
   *
   * @param user - user instance
   * @param options - sequelize options
   */
  async destroy(user: User, options: Options = {}) {
    return await user.destroy({ transaction: options.transaction })
  },
}
