import { lotBetRepository, lotImageRepository, lotRepository } from '#domains/auction'
import { authService } from '#domains/authentication'
import { imageService } from '#domains/storage'
import { userRepository, userService } from '#domains/users'
import { deleteUserPolicy } from './index.delete.policy'
import { deleteUserRequest } from './index.delete.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await deleteUserRequest(event)

  deleteUserPolicy(event)

  const userId = request.params.id

  // Fetch user with row lock to ensure no other process is modifying this user
  const user = await useDatabaseTransaction(async (transaction) => {
    return await userRepository.findByPk(userId, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })
  })

  if (!user) {
    throw createAppError('USER_NOT_FOUND', { id: userId })
  }

  // Revoke/delete all active sessions
  const sessions = await authService.getSessions(userId)
  const sessionUuids = Object.values(sessions).map(session => session.uuid)

  if (sessionUuids.length > 0) {
    await authService.deleteSessions(userId, sessionUuids)
  }

  // Remove user's bets
  await useDatabaseTransaction(async (transaction) => {
    await lotBetRepository.destroyByUserId(userId, { transaction })
  })

  // Remove user's lots with image cleanup
  const lots = await useDatabaseTransaction(async (transaction) => {
    return await lotRepository.findAllBySellerIdWithLock(userId, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })
  })

  for (const lot of lots) {
    const images = await useDatabaseTransaction(async (transaction) => {
      return await lotImageRepository.findAllByLotId(lot.id, { transaction })
    })

    const imageIds = images.map(image => image.id)

    // Attempt to delete images, but proceed even if deletion fails
    try {
      await imageService.destroySafely(imageIds)
    }
    catch (error) {
      logger.warn(`Failed to delete images for lot ${lot.id} during user ${userId} deletion:`, error)
    }

    // Delete the lot
    await useDatabaseTransaction(async (transaction) => {
      await lotRepository.destroyByPk(lot.id, { transaction })
    })
  }

  // Finally, delete the user
  await userService.delete(userId)

  setResponseStatus(event, 204)
})
