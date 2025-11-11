import type { Image } from '../database'
import { lotImageRepository } from '../repositories/lot-image.repository'
import { lotRepository } from '../repositories/lot.repository'

export const lotService = {
  /**
   * Returns a lot instance or throw.
   *
   * @param id lot primary key
   * @returns lot instance
   */
  async getLotOrFail(id: number) {
    const lot = await lotRepository.findById(id)

    if (!lot) {
      throw createError({
        message: 'Лот не знайдено',
        status: 404,
      })
    }

    return lot
  },

  /**
   * Attach images to lot by primary key.
   *
   * @param id lot primary key
   * @param images images instance
   */
  async attachImages(id: number, images: Image[]) {
    const db = useDatabase()
    const transaction = await useDatabaseTransaction()

    const lot = await lotRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!lot) {
      throw createError({
        message: 'Лот не знайдено',
        status: 404,
      })
    }

    try {
      const currentMaxOrder = await lotImageRepository.getMaxOrder(id, { transaction })

      const linksToCreate = images.map((image, index) => ({
        lotId: id,
        imageId: image.id,
        order: currentMaxOrder + 1 + index,
      }))

      await db.LotImage.bulkCreate(linksToCreate, { transaction })

      await transaction.commit()
    }
    catch (error) {
      await transaction.rollback()

      throw createError({
        message: 'Не вдалося приєднати зображення до лотів',
        status: 500,
        cause: error,
      })
    }
  },

  /**
   * Unattach images from lot by primary key.
   *
   * @param id lot primary key
   * @param imageIds unsafe image primary keys
   * @returns safe image primary keys which already unattached
   */
  async unattachImages(id: number, imageIds: number[]) {
    try {
      const existingLinks = await lotImageRepository.findAllLinksByLot(id, imageIds)

      const safeLinkIds = existingLinks.map(link => link.id)
      const safeImageIds = existingLinks.map(link => link.imageId)

      await lotImageRepository.destoryByIds(safeLinkIds)

      return safeImageIds
    }
    catch (error) {
      throw createError({
        message: 'Не вдалося відкріпити зображення',
        status: 500,
        cause: error,
      })
    }
  },
}
