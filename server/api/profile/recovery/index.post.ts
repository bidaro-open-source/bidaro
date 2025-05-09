import {
  resetPasswordRequest,
} from '~~/server/requests/profile/recovery/index.post'
import { createPasswordResetToken } from '~~/server/services/password-reset'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const request = await validateRequest(event, resetPasswordRequest)

  const user = await db.User.findOne({
    where: { email: request.body.email },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувача з такою поштою не знайдено',
    })
  }

  const token = await createPasswordResetToken(user.id)

  const config = useRuntimeConfig()

  await sendEmail(event, {
    to: request.body.email,
    subject: 'Скидання пароля - Bidaro',
    template: {
      html: `Для скидання пароля, натисніть сюди <a href="${config.public.appUrl}/profile/recovery/${token}">сюди</a>`,
      text: `Токен скидання пароля: ${token}`,
    },
  })
})
