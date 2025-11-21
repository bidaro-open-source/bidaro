import type { LOCK, Transaction } from 'sequelize'
import type { UserAttributesOptional } from '../database'

interface Options {
  lock?: LOCK
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
   * Finds a user by their primary key.
   *
   * @param id - user primary key
   * @param options - sequelize options
   * @returns user or null if not found
   */
  async findByIdWithLock(id: number, options: Required<Options>) {
    const db = useDatabase()

    return db.User.findByPk(id, {
      lock: options.lock,
      transaction: options.transaction,
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
   * Updates a user record in the database.
   *
   * @param id - user primary key
   * @param data - user attributes to update
   * @param options - sequelize options
   * @returns updated user instance
   */
  async updateById(id: number, data: Partial<UserAttributesOptional>, options: Options = {}) {
    const db = useDatabase()

    const [_, [user]] = await db.User.update(
      data,
      {
        where: { id },
        transaction: options.transaction,
        returning: true,
      },
    )

    return user
  },

  /**
   * Destroys a user record in the database.
   *
   * @param id - user primary key
   * @param options - sequelize options
   */
  async destroyById(id: number, options: Options = {}) {
    const db = useDatabase()

    return await db.User.destroy({
      where: { id },
      transaction: options.transaction,
    })
  },
}
