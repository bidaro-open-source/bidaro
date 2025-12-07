import type { Image } from '#database'
import { AppError } from '#classes/app-error'
import { lotRepository } from '../lots/lot.repository'
import { lotSource } from '../lots/lot.source'
import { lotImageRepository } from './lot-image.repository'

class LotImageService {
  /**
   * Attach images to lot by primary key.
   *
   * @param id lot primary key
   * @param images images instance
   * @throws {AppError} LOT_NOT_FOUND
   */
  async attachImages(id: number, images: Image[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw new AppError('LOT_NOT_FOUND')
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
   * @throws {AppError} LOT_NOT_FOUND
   */
  async unattachImages(id: number, imageIds: number[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw new AppError('LOT_NOT_FOUND')
      }

      const existingLinks = await lotImageRepository.findAllLinksByLotId(id, { transaction })

      const removedImageIds = existingLinks
        .filter(link => imageIds.includes(link.imageId))
        .map(link => link.imageId)

      if (removedImageIds.length === 0) {
        return []
      }

      const allLinkIds = existingLinks.map(link => link.id)

      await lotImageRepository.destroyByPks(allLinkIds, { transaction })

      const remainingLinks = existingLinks
        .sort((a, b) => a.order - b.order)
        .filter(link => !imageIds.includes(link.imageId))
        .map((link, index) => ({
          id: link.id,
          lotId: link.lotId,
          imageId: link.imageId,
          order: index,
        }))

      await lotImageRepository.bulkCreate(remainingLinks, { transaction })

      useDatabaseAfterCommit(transaction, 'lot-image.service.unattach-images', async () => {
        await lotSource.invalidate(lot)
      })

      return removedImageIds
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
   * @param id lot primary key
   * @param imageIds image ids in new order
   * @throws {AppError} LOT_NOT_FOUND
   * @throws {AppError} LOT_IMAGE_ORDER_INVALID
   */
  async updateImageOrder(id: number, imageIds: number[]) {
    return await useDatabaseTransaction(async (transaction) => {
      const lot = await lotRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!lot) {
        throw new AppError('LOT_NOT_FOUND')
      }

      const currentLinks = await lotImageRepository.findAllLinksByLotId(id, { transaction })

      const currentImageIds = new Set(currentLinks.map(link => link.imageId))
      const newImageIds = new Set(imageIds)

      const extraIds = newImageIds.difference(currentImageIds)
      if (extraIds.size > 0) {
        throw new AppError('LOT_IMAGE_ORDER_INVALID')
      }

      const missingIds = currentImageIds.difference(newImageIds)
      if (missingIds.size > 0) {
        throw new AppError('LOT_IMAGE_ORDER_INVALID')
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
