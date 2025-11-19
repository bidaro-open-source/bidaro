import type { Transaction } from 'sequelize'

interface Options {
  transaction?: Transaction
}

export const roleRepository = {
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
}
