import { lotBetRepository, lotRepository, lotSource } from '#domains/auction'
import { authService } from '#domains/authentication'
import { imageService } from '#domains/storage'
import { userRepository, userSource } from '#domains/users'
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

  const user = await userRepository.findByPk(userId)

  if (!user) {
    throw createAppError('USER_NOT_FOUND', { id: userId })
  }

  const lots = await lotRepository.findAllBySellerIdWithImages(userId)

  const allImageIds = lots.flatMap(lot => lot.images?.map(image => image.id) || [])

  try {
    await imageService.destroySafely(allImageIds)
  }
  catch (error) {
    logger.warn(`Failed to delete images for user ${userId}. Images ids: ${allImageIds.join(', ')}`, error)
  }

  const sessions = await authService.getSessions(userId)
  const sessionUuids = Object.values(sessions).map(session => session.uuid)

  if (sessionUuids.length > 0) {
    await authService.deleteSessions(userId, sessionUuids)
  }

  await useDatabaseTransaction(async (transaction) => {
    await lotBetRepository.destroyByUserId(userId, { transaction })

    await lotRepository.destroyBySellerId(userId, { transaction })

    await userRepository.destroyByPk(userId, { transaction })

    useDatabaseAfterCommit(transaction, 'user.delete', async () => {
      await lotSource.invalidate(lots)
      await userSource.invalidate(user)
    })
  })

  setResponseStatus(event, 204)
})
