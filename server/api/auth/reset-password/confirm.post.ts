import { hash } from 'bcrypt'
import {
  parseRequest,
} from '~/server/requests/auth/reset-password/confirm.post'
import {
  deletePasswordResetToken,
  getUserIdByResetToken,
} from '~/server/services/password-reset'

export default defineEventHandler(async (event) => {
  const db = useDatabase()

  const body = await parseRequest(event)

  const uid = await getUserIdByResetToken(body.token)

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
    password: await hash(body.password, 10),
  })

  await deletePasswordResetToken(body.token)

  return {
    ok: true,
  }
})
