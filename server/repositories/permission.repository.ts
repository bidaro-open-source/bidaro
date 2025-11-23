import type { Transaction } from 'sequelize'
import type { PermissionAttributes } from '../database'

interface Options {
  transaction?: Transaction
}

export const permissionRepository = {
  /**
   * Find all permissions.
   *
   * @param options - sequelize options.
   * @returns The permission record or null if not found.
   */
  async findAll(options: Options = {}) {
    const db = useDatabase()

    return await db.Permission.findAll({
      transaction: options.transaction,
    })
  },

  /**
   * Find permission by name.
   *
   * @param name - Name of the permission.
   * @param options - sequelize options.
   * @returns The permission record or null if not found.
   */
  async findByName(name: string, options: Options = {}) {
    const db = useDatabase()

    return await db.Permission.findByPk(name, {
      transaction: options.transaction,
    })
  },

  /**
   * Find all permissions by names.
   *
   * @param names - Array of permission names.
   * @param options - sequelize options.
   * @returns Array of permission records.
   */
  async findAllByNames(names: string[], options: Options = {}) {
    const db = useDatabase()

    return await db.Permission.findAll({
      where: { name: names },
      transaction: options.transaction,
    })
  },

  /**
   * Save a changed permission record in the database.
   *
   * @param name - permission primary key
   * @param data - partial permission attributes to update
   * @param options - sequelize options
   * @returns updated permission instance
   */
  async updateById(name: string, data: Partial<Pick<PermissionAttributes, 'displayName' | 'description'>>, options: Options = {}) {
    const db = useDatabase()

    const [_, [permission]] = await db.Permission.update(
      {
        displayName: data.displayName || undefined,
        description: data.description || undefined,
      },
      {
        where: { name },
        transaction: options.transaction,
        returning: true,
      },
    )

    return permission
  },
}
