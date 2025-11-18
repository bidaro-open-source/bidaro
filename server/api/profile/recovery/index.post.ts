import {
  resetPasswordRequest,
} from '~~/server/api/profile/recovery/index.request'
import { userRepository } from '~~/server/repositories/user.repository'
import { profileRecoveryService } from '~~/server/services/profile-recovery.service'

export default defineEventHandler(async (event) => {
  const request = await resetPasswordRequest(event)

  const user = await userRepository.findByEmail(request.body.email)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувача з такою поштою не знайдено',
    })
  }

  const token = await profileRecoveryService.createPasswordResetToken(user.id)

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
