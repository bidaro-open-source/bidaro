import { recoveryService } from '#domains/authentication'
import { userRepository } from '#domains/users'
import {
  resetPasswordRequest,
} from '~~/server/api/profile/recovery/index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 0,
    anonymousLimit: 30,
    duration: 60,
  })

  const request = await resetPasswordRequest(event)

  const user = await userRepository.findByEmail(request.body.email)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувача з такою поштою не знайдено',
    })
  }

  const token = await recoveryService.createToken(user.id)

  const config = useRuntimeConfig()

  await sendMail(event, {
    to: request.body.email,
    subject: 'Скидання пароля - Bidaro',
    template: {
      html: `Для скидання пароля, натисніть сюди <a href="${config.public.appUrl}/profile/recovery/${token}">сюди</a>`,
      text: `Токен скидання пароля: ${token}`,
    },
  })
})
