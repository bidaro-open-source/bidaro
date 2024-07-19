import { hash } from 'bcrypt'
import {
  confirmResetPasswordRequest,
} from '~/server/requests/auth/reset-password/confirm.post'
import {
  deletePasswordResetToken,
  getUserIdByResetToken,
} from '~/server/services/password-reset'

export default defineEventHandler(async (event) => {
  const db = useDatabase()

  const request = await validateRequest(event, confirmResetPasswordRequest)

  const uid = await getUserIdByResetToken(request.body.token)

  if (!uid) {
    throw createError({
      statusCode: 404,
      message: 'Token not found',
    })
  }

  const user = await db.User.findOne({ where: { id: uid } })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  await user.update({
    password: await hash(request.body.password, 10),
  })

  await deletePasswordResetToken(request.body.token)

  return {
    ok: true,
  }
})
