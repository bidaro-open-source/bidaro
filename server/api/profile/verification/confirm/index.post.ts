import { emailVerifyConfirmRequest } from '~~/server/api/profile/verification/confirm/index.request'
import { userRepository } from '~~/server/repositories/user.repository'
import { userService } from '~~/server/services/user.service'
import { profileVerificationService } from '~~/server/services/verification.service'

export default defineEventHandler(async (event) => {
  const request = await emailVerifyConfirmRequest(event)

  const uid = await profileVerificationService.getUserIdByEmailVerificationToken(
    request.body.token,
  )

  if (!uid) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен верифікації не знайдено, можливо ви вже активували акаунт або час дії токена закінчився.',
    })
  }

  const user = await userRepository.findById(uid)

  if (!user) {
    await profileVerificationService.deleteEmailVerificationTokenByUid(uid)

    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен верифікації правильний, проте акаунт не знайдено. Можливо, його було видалено.',
    })
  }

  await userService.verifyEmail(user.id)

  await profileVerificationService.deleteEmailVerificationTokenByUid(user.id)
})
