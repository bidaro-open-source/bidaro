import { AppError } from '#classes/app-error'
import { recoveryService } from '#domains/authentication'
import { challengeTokenService } from '#domains/security'
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

  const config = useRuntimeConfig()

  if (config.challenge.enabled) {
    const isValid = await challengeTokenService.verify(request.body.captchaToken || '')

    if (!isValid) {
      throw new AppError('INVALID_CHALLENGE_SOLUTION')
    }
  }

  const user = await userRepository.findByEmail(request.body.email)

  if (!user) {
    throw new AppError('EMAIL_NOT_FOUND')
  }

  const token = await recoveryService.createToken(user.id)

  await sendMail(event, {
    to: request.body.email,
    subject: 'Скидання пароля - Bidaro',
    template: {
      html: `Для скидання пароля, натисніть сюди <a href="${config.public.appUrl}/profile/recovery/${token}">сюди</a>`,
      text: `Токен скидання пароля: ${token}`,
    },
  })
})
