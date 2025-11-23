import type { LOCK, Transaction } from 'sequelize'
import type { RoleAttributesOptional } from '../database/models/Role'
import { QueryTypes } from 'sequelize'

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

  /**
   * Finds all permissions for a role by role name.
   *
   * @param name - role primary key
   * @param options - sequelize options
   * @returns array of permissions for the role
   */
  async findAllPermissionsByName(name: string, options: Options = {}) {
    const db = useDatabase()

    const role = await db.Role.findByPk(name, {
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

    return role?.permissions ?? []
  },

  /**
   * Sets permissions for a role.
   *
   * @param name - role primary key
   * @param permissionNames - array of permission names
   * @param options - sequelize options
   */
  async setPermissions(name: string, permissionNames: string[], options: Options = {}) {
    const db = useDatabase()

    // First, delete existing permissions
    await db.sequelize.query(
      'DELETE FROM roles_has_permissions WHERE role = :roleName',
      {
        replacements: { roleName: name },
        type: QueryTypes.DELETE,
        transaction: options.transaction,
      },
    )

    // Then, insert new permissions if any
    if (permissionNames.length > 0) {
      // Build safe parameterized insert
      const placeholders = permissionNames.map((_, i) => `(:roleName, :permission${i})`).join(', ')
      const replacements: Record<string, string> = { roleName: name }
      permissionNames.forEach((permission, i) => {
        replacements[`permission${i}`] = permission
      })

      await db.sequelize.query(
        `INSERT INTO roles_has_permissions (role, permission) VALUES ${placeholders}`,
        {
          replacements,
          type: QueryTypes.INSERT,
          transaction: options.transaction,
        },
      )
    }
  },
}
