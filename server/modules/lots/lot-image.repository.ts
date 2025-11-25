import type { LOCK, Transaction } from 'sequelize'
import type { LotImageAttributesOptional } from '../../database'
import { Op } from 'sequelize'

interface Options {
  lock?: LOCK
  transaction?: Transaction
}

export const lotImageRepository = {
  /**
   * Find all images attached to a lot.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Promise resolving to an array of Image instances (may be empty).
   */
  async findAllByLotId(lotId: number, options: Options = {}) {
    const db = useDatabase()

    const lot = await db.Lot.findByPk(lotId, {
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

    return lot && lot.images ? lot.images : []
  },

  /**
   * Fetch links (join rows) for a lot returning only imageId attribute.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Promise resolving to an array of LotImage rows containing imageId.
   */
  async findAllLinksByLotId(lotId: number, options: Options = {}) {
    const db = useDatabase()

    return await db.LotImage.findAll({
      where: { lotId },
      attributes: ['imageId'],
      transaction: options.transaction,
    })
  },

  /**
   * Find lot-image link rows for given image primary keys.
   *
   * @param lotId - Primary key of the lot.
   * @param imageIds - Array of image primary keys to filter by.
   * @param options - sequelize options
   * @returns Promise resolving to matching LotImage rows.
   */
  async findAllLinksByLotAndPks(lotId: number, imageIds: number[], options: Options = {}) {
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

  /**
   * Finds maximum 'order' value among lot-image links for a lot.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Promise resolving to the max order (returns 1 if none found).
   */
  async findMaxOrder(lotId: number, options: Options = {}) {
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

  /**
   * Destroy all lot-image links for a given lot id.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Number of rows deleted.
   */
  async destroyByLotId(lotId: number, options: Options = {}) {
    const db = useDatabase()

    return await db.LotImage.destroy({
      where: { lotId },
      transaction: options.transaction,
    })
  },

  /**
   * Destroy lot-image links by their link ids.
   *
   * @param linkIds - Array of LotImage primary keys to remove.
   * @returns Number of rows deleted.
   */
  async destroyByIds(linkIds: number[], options: Options = {}) {
    const db = useDatabase()

    return await db.LotImage.destroy({
      transaction: options.transaction,
      where: {
        id: {
          [Op.in]: linkIds,
        },
      },
    })
  },

  /**
   * Bulk create lot-image link records.
   *
   * @param records - Array of LotImage records to create.
   * @param options - sequelize options
   * @returns Promise resolving to created LotImage instances.
   */
  async bulkCreate(records: LotImageAttributesOptional[], options: Options = {}) {
    const db = useDatabase()

    return await db.LotImage.bulkCreate(records, {
      transaction: options.transaction,
    })
  },

}
