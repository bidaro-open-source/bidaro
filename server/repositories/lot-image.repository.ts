import type { LOCK, Transaction } from 'sequelize'
import { Op } from 'sequelize'

interface Options {
  lock?: LOCK
  transaction?: Transaction
}

export const lotImageRepository = {
  async findAllByLot(lotId: number, options: Options = {}) {
    const db = useDatabase()

    const lot = await db.Lot.findByPk(lotId, {
      lock: options.lock,
      transaction: options.transaction,
      include: [
        {
          model: db.Image,
          as: 'images',
          through: { attributes: [] },
          order: [
            [db.LotImage, 'order', 'ASC'],
          ],
        },
      ],
    })

    if (!lot || !lot.images) {
      return []
    }

    return lot.images
  },

  async findAllLinksByLot(lotId: number, imageIds: number[], options: Options = {}) {
    const db = useDatabase()

    return await db.LotImage.findAll({
      lock: options.lock,
      transaction: options.transaction,
      where: {
        lotId,
        imageId: {
          [Op.in]: imageIds,
        },
      },
    })
  },

  async getMaxOrder(lotId: number, options: Options = {}) {
    const db = useDatabase()

    const result = await db.LotImage.findOne({
      raw: true,
      where: { lotId },
      transaction: options.transaction,
      attributes: [
        [db.sequelize.fn('max', db.sequelize.col('order')), 'max_order'],
      ],
    })

    // @ts-expect-error used raw reqeust
    return result.max_order ?? 1
  },

  async destoryByIds(linkIds: number[]) {
    const db = useDatabase()

    return await db.LotImage.destroy({
      where: {
        id: {
          [Op.in]: linkIds,
        },
      },
    })
  },
}
