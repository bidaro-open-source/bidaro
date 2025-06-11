import { userRepository } from '~~/server/repositories/user.repository'
import {
  confirmResetPasswordRequest,
} from '~~/server/requests/profile/recovery/confirm.request'
import {
  deletePasswordResetToken,
  getUserIdByResetToken,
} from '~~/server/services/profile-recovery'

export default defineEventHandler(async (event) => {
  const request = await confirmResetPasswordRequest(event)

  const uid = await getUserIdByResetToken(request.body.token)

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

  await deletePasswordResetToken(request.body.token)
})
