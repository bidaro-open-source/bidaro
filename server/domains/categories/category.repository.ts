import type { RepositoryOptions } from '~~/server/class/Repository'
import type { Category, CategoryAttributesOptional } from '../../database/models/Category'
import { Op, QueryTypes } from 'sequelize'
import { Repository } from '~~/server/class/Repository'

class CategoryRepository extends Repository<Category, CategoryAttributesOptional> {
  protected get model() {
    return useDatabase().Category
  }

  /**
   * Finds a category by their slug.
   *
   * @param slug - category slug
   * @param options - sequelize options
   * @returns Category instance or null if not found
   */
  async findBySlug(slug: string, options: RepositoryOptions = {}) {
    return await this.model.findOne({
      where: { slug },
      transaction: options.transaction,
    })
  }

  /**
   * Finds a categories by their path.
   *
   * @param path - category path
   * @param options - sequelize options
   * @returns array of category instances
   */
  async findAllByPathWithLock(path: string, options: Required<RepositoryOptions>) {
    return await this.model.findAll({
      lock: options.lock,
      transaction: options.transaction,
      where: {
        path: {
          [Op.like]: `${path}%`,
        },
      },
    })
  }

  /**
   * Finds categories by their parent id.
   *
   * @param parentId - category parent id
   * @param options - sequelize options
   * @returns array of categories with given parent id
   */
  async findAllByParentId(parentId: number | null, options: RepositoryOptions = {}) {
    return await this.model.findAll({
      where: { parentId },
      transaction: options.transaction,
    })
  }

  /**
   * Counts lots for a category and all its descendants by path.
   *
   * @param path - category path (prefix to match categories and their descendants)
   * @param options - sequelize options
   * @returns number of lots for the category and its descendants
   */
  async countLotsByPath(path: string, options: RepositoryOptions = {}) {
    const db = useDatabase()

    return await db.Lot.count({
      transaction: options.transaction,
      include: [{
        model: db.Category,
        as: 'category',
        where: {
          path: {
            [Op.like]: `${path}%`,
          },
        },
        required: true,
        attributes: [],
      }],
    })
  }

  /**
   * Update category paths for category and its descendants.
   *
   * @param oldPath - old category path
   * @param newPath - new category path
   * @param options - sequelize options
   */
  async updatePaths(oldPath: string, newPath: string, options: RepositoryOptions = {}) {
    const db = useDatabase()
    const updateQuery = `
      UPDATE "${db.sequelize.models.Category.tableName}"
      SET path = REPLACE(path, :oldPathPrefix, :newPathPrefix)
      WHERE path LIKE :oldPathLike;
    `

    await db.sequelize.query(updateQuery, {
      replacements: {
        oldPathPrefix: oldPath,
        newPathPrefix: newPath,
        oldPathLike: `${oldPath}%`,
      },
      type: QueryTypes.UPDATE,
      transaction: options.transaction,
    })
  }
}

export const categoryRepository = new CategoryRepository()
