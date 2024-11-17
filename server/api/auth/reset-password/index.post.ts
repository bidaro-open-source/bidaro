import {
  resetPasswordRequest,
} from '~/server/requests/auth/reset-password/index.post'
import { createPasswordResetToken } from '~/server/services/password-reset'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const request = await validateRequest(event, resetPasswordRequest)

  const user = await db.User.findOne({
    where: { email: request.body.email },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'Аккаунт не знайдено',
    })
  }

  const token = await createPasswordResetToken(user.id)

  await sendEmail(event, {
    to: request.body.email,
    subject: 'Reset password',
    template: {
      html: `Reset token: ${token}`,
      text: `Reset token: ${token}`,
    },
  })

  return {
    ok: true,
  }
})
