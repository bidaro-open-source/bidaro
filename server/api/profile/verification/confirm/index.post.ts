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
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен верифікації не знайдено, можливо ви вже активували акаунт або час дії токена закінчився.',
    })
  }

  const user = await userRepository.findByPk(uid)

  if (!user) {
    await verificationService.deleteTokenByUserId(uid)

    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен верифікації правильний, проте акаунт не знайдено. Можливо, його було видалено.',
    })
  }

  await userService.verifyEmail(user.id)

  await verificationService.deleteTokenByUserId(user.id)
})
