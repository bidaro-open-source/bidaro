import { emailVerifyConfirmRequest } from '~~/server/requests/profile/verification/confrim.request'
import {
  deleteEmailVerificationTokenByUid,
  getUserIdByEmailVerificationToken,
} from '~~/server/services/profile-verification'
import { fetchUser } from '~~/server/services/users-service'

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

  const user = await fetchUser(uid)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен верифікації правильний, проте акаунт не знайдено. Можливо, його було видалено.',
    })
  }

  await user.update({
    emailVerifiedAt: new Date(),
  })

  await deleteEmailVerificationTokenByUid(user.id)
})
