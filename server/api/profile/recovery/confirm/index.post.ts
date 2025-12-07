import { recoveryService } from '#domains/authentication'
import { userRepository, userService } from '#domains/users'
import { createAppError } from '#utils/create-app-error'
import {
  confirmResetPasswordRequest,
} from '~~/server/api/profile/recovery/confirm/index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 0,
    anonymousLimit: 60,
    duration: 60,
  })

  const request = await confirmResetPasswordRequest(event)

  const uid = await recoveryService.getUserIdByToken(request.body.token)

  if (!uid) {
    throw createAppError('RECOVERY_TOKEN_NOT_FOUND')
  }

  const user = await userRepository.findByPk(uid)

  if (!user) {
    await recoveryService.deleteToken(request.body.token)

    throw createAppError('USER_NOT_FOUND', { userId: uid })
  }

  await userService.updatePassword(user.id, request.body.password)

  await recoveryService.deleteToken(request.body.token)
})
