import { AppError } from '#classes/app-error'
import { recoveryService } from '#domains/authentication'
import { userRepository, userService } from '#domains/users'
import {
  confirmResetPasswordRequest,
} from '~~/server/api/profile/recovery/confirm/index.request'

/**
 * API endpoint handler
 * @throws {AppError} RECOVERY_TOKEN_NOT_FOUND
 * @throws {AppError} USER_NOT_FOUND
 */
export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 0,
    anonymousLimit: 60,
    duration: 60,
  })

  const request = await confirmResetPasswordRequest(event)

  const uid = await recoveryService.getUserIdByToken(request.body.token)

  if (!uid) {
    throw new AppError('RECOVERY_TOKEN_NOT_FOUND')
  }

  const user = await userRepository.findByPk(uid)

  if (!user) {
    await recoveryService.deleteToken(request.body.token)

    throw new AppError('USER_NOT_FOUND', { userId: uid })
  }

  await userService.updatePassword(user.id, request.body.password)

  await recoveryService.deleteToken(request.body.token)
})
