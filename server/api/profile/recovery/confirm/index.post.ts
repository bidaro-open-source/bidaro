import { recoveryService } from '#domains/authentication'
import { userRepository, userService } from '#domains/users'
import {
  confirmResetPasswordRequest,
} from '~~/server/api/profile/recovery/confirm/index.request'

export default defineEventHandler(async (event) => {
  await useRateLimiter(event, {
    authenticatedLimit: 0,
    anonymousLimit: 60,
    duration: 60,
  })

  const request = await confirmResetPasswordRequest(event)

  const uid = await recoveryService.getUserIdByToken(request.body.token)

  if (!uid) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен скидання пароля не знайдено, можливо ви вже скинули пароль або час дії токена закінчився.',
    })
  }

  const user = await userRepository.findByPk(uid)

  if (!user) {
    await recoveryService.deleteToken(request.body.token)

    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен скидання пароля правильний, проте акаунт не знайдений, можливо, користувача було видалено.',
    })
  }

  await userService.updatePassword(user.id, request.body.password)

  await recoveryService.deleteToken(request.body.token)
})
