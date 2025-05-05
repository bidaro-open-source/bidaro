import { emailVerifyConfirmRequest } from '~~/server/requests/profile/verify'
import {
  deleteEmailVerificationTokenByUid,
  getUserIdByEmailVerificationToken,
} from '~~/server/services/email-verification'
import { fetchUser } from '~~/server/services/users-service'

export default defineEventHandler(async (event) => {
  const request = await validateRequest(event, emailVerifyConfirmRequest)

  const uid = await getUserIdByEmailVerificationToken(
    request.body.token,
  )

  if (!uid) {
    throw createError({
      statusCode: 404,
      message: 'Token not found',
    })
  }

  const user = await fetchUser(uid)

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  await user.update({
    emailVerifiedAt: new Date(),
  })

  await deleteEmailVerificationTokenByUid(user.id)
})
