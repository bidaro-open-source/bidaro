import { emailVerifyConfirmRequest } from '~~/server/api/profile/verification/confirm/index.request'
import { userRepository } from '~~/server/repositories/user.repository'
import {
  deleteEmailVerificationTokenByUid,
  getUserIdByEmailVerificationToken,
} from '~~/server/services/profile-verification'

export default defineEventHandler(async (event) => {
  const request = await emailVerifyConfirmRequest(event)

  const uid = await getUserIdByEmailVerificationToken(
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
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен верифікації правильний, проте акаунт не знайдено. Можливо, його було видалено.',
    })
  }

  user.emailVerifiedAt = new Date()

  await userRepository.save(user)

  await deleteEmailVerificationTokenByUid(user.id)
})
