import type { WhereOptions } from 'sequelize'
import type { LotAttributes } from '~~/server/database'
import { Op } from 'sequelize'

interface FindAllForCatalogOptions {
  where?: WhereOptions<LotAttributes>
  limit: number
  offset: number
  categoryPath?: string
  order?: Array<[string, 'ASC' | 'DESC']>
}

class LotCatalogRepository {
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
          where: { order: 0 },
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
