import type { RepositoryOptions } from '#class/BaseRepository'
import type { LotImage, LotImageAttributesOptional } from '#database'
import { BaseRepository } from '#class/BaseRepository'
import { Op } from 'sequelize'

class LotImageRepository extends BaseRepository<LotImage> {
  protected get model() {
    return useDatabase().LotImage
  }

  /**
   * Find all images attached to a lot.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Promise resolving to an array of Image instances (may be empty).
   */
  async findAllByLotId(lotId: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    const lotImages = await this.model.findAll({
      where: { lotId },
      transaction: options.transaction,
      include: [
        {
          model: db.Image,
          as: 'image',
        },
      ],
      order: [['order', 'ASC']],
    })

    return lotImages
      .map(link => link.image)
      .filter(image => image !== undefined)
  }

  /**
   * Fetch links (join rows) for a lot returning only imageId attribute.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Promise resolving to an array of LotImage rows containing imageId.
   */
  async findAllLinksByLotId(lotId: number, options: RepositoryOptions = {}) {
    return await this.model.findAll({
      where: { lotId },
      attributes: ['imageId'],
      transaction: options.transaction,
    })
  }

  /**
   * Find lot-image link rows for given image primary keys.
   *
   * @param lotId - Primary key of the lot.
   * @param imageIds - Array of image primary keys to filter by.
   * @param options - sequelize options
   * @returns Promise resolving to matching LotImage rows.
   */
  async findAllLinksByLotAndPks(
    lotId: number,
    imageIds: number[],
    options: RepositoryOptions = {},
  ) {
    return await this.model.findAll({
      lock: options.lock,
      transaction: options.transaction,
      where: {
        lotId,
        imageId: {
          [Op.in]: imageIds,
        },
      },
    })
  }

  /**
   * Finds maximum 'order' value among lot-image links for a lot.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Promise resolving to the max order (returns 1 if none found).
   */
  async findMaxOrder(lotId: number, options: RepositoryOptions = {}) {
    const db = useDatabase()

    const result = await this.model.findOne({
      raw: true,
      where: { lotId },
      transaction: options.transaction,
      attributes: [
        [db.sequelize.fn('max', db.sequelize.col('order')), 'max_order'],
      ],
    })

    // @ts-expect-error used raw reqeust
    return result.max_order ?? 1
  }

  /**
   * Destroy all lot-image links for a given lot id.
   *
   * @param lotId - Primary key of the lot.
   * @param options - sequelize options
   * @returns Number of rows deleted.
   */
  async destroyByLotPk(lotId: number, options: RepositoryOptions = {}) {
    return await this.model.destroy({
      where: { lotId },
      transaction: options.transaction,
    })
  }

  /**
   * Bulk create lot-image link records.
   *
   * @param records - Array of LotImage records to create.
   * @param options - sequelize options
   * @returns Promise resolving to created LotImage instances.
   */
  async bulkCreate(records: LotImageAttributesOptional[], options: RepositoryOptions = {}) {
    return await this.model.bulkCreate(records, {
      transaction: options.transaction,
    })
  }
}

export const lotImageRepository = new LotImageRepository()
