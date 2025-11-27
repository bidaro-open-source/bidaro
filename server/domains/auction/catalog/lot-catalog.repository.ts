import type { LotAttributes } from '#database'
import type { WhereOptions } from 'sequelize'
import { Op } from 'sequelize'

interface FindAllForCatalogOptions {
  where?: WhereOptions<LotAttributes>
  limit: number
  offset: number
  categoryPath?: string
  order?: Array<[string, 'ASC' | 'DESC']>
}

class LotCatalogRepository {
  /**
   * Finds all lots for the catalog with associations.
   *
   * @param options - query options including where, limit, offset, categoryPath, order
   * @returns lots with count and associated data
   */
  async findAllForCatalog(options: FindAllForCatalogOptions) {
    const db = useDatabase()

    return await db.Lot.findAndCountAll({
      where: options.where,
      limit: options.limit,
      offset: options.offset,
      order: options.order ?? [['expirationDate', 'ASC']],
      include: [
        {
          model: db.LotImage,
          as: 'cover',
          required: false,
          include: [
            {
              model: db.Image,
              as: 'image',
              required: false,
            },
          ],
        },
        {
          model: db.Category,
          as: 'category',
          attributes: ['id', 'displayName'],
          where: options.categoryPath
            ? { path: { [Op.like]: `${options.categoryPath}%` } }
            : undefined,
          required: !!options.categoryPath,
        },
        {
          model: db.User,
          as: 'seller',
          attributes: ['name', 'surname', 'username'],
        },
        {
          model: db.User,
          as: 'winner',
          attributes: ['username'],
        },
      ],
    })
  }
}

export const lotCatalogRepository = new LotCatalogRepository()
