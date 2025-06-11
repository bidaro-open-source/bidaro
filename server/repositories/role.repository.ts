import type { Transaction } from 'sequelize'
import type { Role } from '../database'

interface Options {
  transaction?: Transaction
}

export const roleRepository = {
  /**
   * Finds a role by their name.
   *
   * Included models:
   * - Permissions (all fields)
   *
   * @param name - role primary key
   * @param options - sequelize options
   * @returns role or null if not found
   */
  findByName(name: string, options: Options = {}): Promise<Role | null> {
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
}
