import { AppError } from '#classes/app-error'
import { verificationService } from '#domains/authentication'
import { userRepository, userService } from '#domains/users'
import { emailVerifyConfirmRequest } from '~~/server/api/profile/verification/confirm/index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 3,
    anonymousLimit: 30,
    duration: 60,
  })

  const request = await emailVerifyConfirmRequest(event)

  const uid = await verificationService.getUserIdByToken(
    request.body.token,
  )

  if (!uid) {
    throw new AppError('VERIFICATION_TOKEN_NOT_FOUND')
  }

  const user = await userRepository.findByPk(uid)

  if (!user) {
    await verificationService.deleteTokenByUserId(uid)

    throw new AppError('USER_NOT_FOUND', { userId: uid })
  }

  await userService.verifyEmail(user.id)

  await verificationService.deleteTokenByUserId(user.id)
})
