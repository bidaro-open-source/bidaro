import type { Image } from '#database'
import { lotRepository } from '../lots/lot.repository'
import { lotSource } from '../lots/lot.source'
import { lotImageRepository } from './lot-image.repository'

class LotImageService {
  /**
   * Attach images to lot by primary key.
   *
   * @param id lot primary key
   * @param images images instance
   */
  async attachImages(id: number, images: Image[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          message: 'Лот не знайдено',
          status: 404,
        })
      }

      const currentMaxOrder = await lotImageRepository.findMaxOrder(id, { transaction })

      const linksToCreate = images.map((image, index) => ({
        lotId: id,
        imageId: image.id,
        order: currentMaxOrder + 1 + index,
      }))

      await lotImageRepository.bulkCreate(linksToCreate, { transaction })

      useDatabaseAfterCommit(transaction, 'lot-image.service.attach-images', async () => {
        await lotSource.invalidate(lot)
      })
    })
  }

  /**
   * Unattach images from lot by primary key.
   *
   * @param id lot primary key
   * @param imageIds unsafe image primary keys
   * @returns safe image primary keys which already unattached
   */
  async unattachImages(id: number, imageIds: number[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          message: 'Лот не знайдено',
          status: 404,
        })
      }

      const existingLinks = await lotImageRepository.findAllLinksByLotAndPks(id, imageIds, { transaction })

      const safeLinkIds = existingLinks.map(link => link.id)
      const safeImageIds = existingLinks.map(link => link.imageId)

      await lotImageRepository.destroyByPks(safeLinkIds, { transaction })

      useDatabaseAfterCommit(transaction, 'lot-image.service.unattach-images', async () => {
        await lotSource.invalidate(lot)
      })

      return safeImageIds
    })
  }

  /**
   * Atomically updates (fully "re-creates") the order of images for a lot.
   *
   * This function performs deleting all old associations and creating new ones
   * within a locked transaction to ensure atomicity and prevent race conditions.
   *
   * To work, it requires all image ids that this lot has.
   *
   * @throws 404 - if a lot not found
   * @throws 422 - if was passed an incomplete array of image ids
   * @throws 422 - if the imageIds contains foreign ids
   *
   * @param id lot primary key
   * @param imageIds image ids in new order
   */
  async updateImageOrder(id: number, imageIds: number[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw createError({
          message: 'Лот не знайдено',
          status: 404,
        })
      }

      const currentLinks = await lotImageRepository.findAllLinksByLotId(id, { transaction })

      const currentImageIds = new Set(currentLinks.map(link => link.imageId))
      const newImageIds = new Set(imageIds)

      const extraIds = newImageIds.difference(currentImageIds)
      if (extraIds.size > 0) {
        throw createError({
          statusCode: 422,
          message: 'Знайдено унікальні ідентифікатори, що не належать лоту ',
        })
      }

      const missingIds = currentImageIds.difference(newImageIds)
      if (missingIds.size > 0) {
        throw createError({
          statusCode: 422,
          message: 'Кількість унікальних ідентифікаторів не відповідає кількості зображень у лоті.',
        })
      }

      await lotImageRepository.destroyByLotPk(id, { transaction })

      const linksToCreate = imageIds.map((imageId, index) => {
        return {
          lotId: id,
          order: index,
          imageId,
        }
      })

      await lotImageRepository.bulkCreate(linksToCreate, { transaction })

      useDatabaseAfterCommit(transaction, 'lot-image.service.update-images-order', async () => {
        await lotSource.invalidate(lot)
      })
    })
  }
}

export const lotImageService = new LotImageService()
