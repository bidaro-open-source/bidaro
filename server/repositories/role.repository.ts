import type { LOCK, Transaction } from 'sequelize'
import type { RoleAttributesOptional } from '../database/models/Role'

interface Options {
  lock?: LOCK
  transaction?: Transaction
}

export const roleRepository = {
  /**
   * Finds all roles.
   *
   * @param options - sequelize options
   * @returns array of roles
   */
  async findAll(options: Options = {}) {
    const db = useDatabase()

    return db.Role.findAll({
      transaction: options.transaction,
      include: [
        {
          model: db.Permission,
          as: 'permissions',
          through: {
            attributes: [],
          },
        },
      ],
    })
  },

  /**
   * Finds a role by their name.
   *
   * @param name - role primary key
   * @param options - sequelize options
   * @returns role or null if not found
   */
  async findByName(name: string, options: Options = {}) {
    const db = useDatabase()

    return db.Role.findByPk(name, {
      transaction: options.transaction,
      include: [
        {
          model: db.Permission,
          as: 'permissions',
          through: {
            attributes: [],
          },
        },
      ],
    })
  },

  /**
   * Finds a role by their name with lock.
   *
   * @param name - role primary key
   * @param options - sequelize options
   * @returns role or null if not found
   */
  async findByNameWithLock(name: string, options: Required<Options>) {
    const db = useDatabase()

    return db.Role.findByPk(name, {
      lock: options.lock,
      transaction: options.transaction,
      include: [
        {
          model: db.Permission,
          as: 'permissions',
          through: {
            attributes: [],
          },
        },
      ],
    })
  },

  /**
   * Creates a new role record in the database.
   *
   * @param fields - role attributes
   * @param options - sequelize options
   * @returns role instance
   */
  async create(fields: RoleAttributesOptional, options: Options = {}) {
    const db = useDatabase()

    return await db.Role.create(
      fields,
      { transaction: options.transaction },
    )
  },

  /**
   * Updates a role by their name.
   *
   * @param name - role primary key
   * @param fields - fields to update
   * @param options - sequelize options
   * @returns updated role instance
   */
  async updateByName(
    name: string,
    fields: Partial<Pick<RoleAttributesOptional, 'displayName' | 'description'>>,
    options: Options = {},
  ) {
    const db = useDatabase()

    const [_, [role]] = await db.Role.update(
      fields,
      {
        where: { name },
        transaction: options.transaction,
        returning: true,
      },
    )

    return role
  },

  /**
   * Deletes a role by their name.
   *
   * @param name - role primary key
   * @param options - sequelize options
   */
  async destroyByName(name: string, options: Options = {}) {
    const db = useDatabase()

    return await db.Role.destroy({
      where: { name },
      transaction: options.transaction,
    })
  },

  /**
   * Counts users for a role.
   *
   * @param name - role primary key
   * @param options - sequelize options
   * @returns number of users with this role
   */
  async countUsersByName(name: string, options: Options = {}) {
    const db = useDatabase()

    return await db.User.count({
      where: { roleName: name },
      transaction: options.transaction,
    })
  },
}
