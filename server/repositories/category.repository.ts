import type { Transaction } from 'sequelize'
import type { Category } from '../database/models/Category'

interface Options {
  transaction?: Transaction
}

export const categoryRepository = {
  /**
   * Finds a category by their primary key.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  findById: (id: number, options: Options = {}): Promise<Category | null> => {
    const db = useDatabase()

    return db.Category.findByPk(id, { transaction: options.transaction })
  },

  /**
   * Build a category tree by their primary key (NULL if build with top level
   * categories).
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  findTreeByParentId: (id: number | null, options: Options = {}): Promise<Category[]> => {
    const db = useDatabase()

    return db.Category.findAll({
      where: { parentId: id },
      transaction: options.transaction,
      include: [
        {
          model: db.Category,
          as: 'children',
          include: [
            {
              model: db.Category,
              as: 'children',
              include: [
                {
                  model: db.Category,
                  as: 'children',
                  include: [
                    {
                      model: db.Category,
                      as: 'children',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  },

  /**
   * Build a category tree with parents by their primary key.
   *
   * @param id - category primary key
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  findParentTreeById: (id: number, options: Options = {}): Promise<Category | null> => {
    const db = useDatabase()

    return db.Category.findByPk(id, {
      transaction: options.transaction,
      include: [
        {
          model: db.Category,
          as: 'parent',
          include: [
            {
              model: db.Category,
              as: 'parent',
              include: [
                {
                  model: db.Category,
                  as: 'parent',
                  include: [
                    {
                      model: db.Category,
                      as: 'parent',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  },
}
