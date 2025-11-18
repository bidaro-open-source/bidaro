import {
  confirmResetPasswordRequest,
} from '~~/server/api/profile/recovery/confirm/index.request'
import { userRepository } from '~~/server/repositories/user.repository'
import { profileRecoveryService } from '~~/server/services/profile-recovery.service'

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
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Токен скидання пароля правильний, проте акаунт не знайдений, можливо, користувача було видалено.',
    })
  }

  user.password = await hashPassword(event, request.body.password)

  await userRepository.save(user)

  await profileRecoveryService.deletePasswordResetToken(request.body.token)
})
