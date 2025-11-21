import {
  confirmResetPasswordRequest,
} from '~~/server/api/profile/recovery/confirm/index.request'
import { userRepository } from '~~/server/repositories/user.repository'
import { profileRecoveryService } from '~~/server/services/recovery.service'
import { userService } from '~~/server/services/user.service'

export default defineEventHandler(async (event) => {
  const request = await confirmResetPasswordRequest(event)

  const uid = await profileRecoveryService.getUserIdByResetToken(request.body.token)

  if (!uid) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен скидання пароля не знайдено, можливо ви вже скинули пароль або час дії токена закінчився.',
    })
  }

  const user = await userRepository.findById(uid)

  if (!user) {
    await profileRecoveryService.deletePasswordResetToken(request.body.token)

    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен скидання пароля правильний, проте акаунт не знайдений, можливо, користувача було видалено.',
    })
  }

  await userService.updatePassword(user.id, request.body.password)

  await profileRecoveryService.deletePasswordResetToken(request.body.token)
})
