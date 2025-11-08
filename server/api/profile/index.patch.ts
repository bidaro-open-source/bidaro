import { z } from 'zod'
import { updateProfileRequest } from '~~/server/api/profile/index.request'
import { userRepository } from '~~/server/repositories/user.repository'
import { createProfileResource } from '~~/server/resources/profile.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await updateProfileRequest(event)

  if (request.body.email) {
    const userInDB = await userRepository.findByUsername(request.body.email)

    if (userInDB) {
      const issues: z.ZodIssue[] = []

      issues.push({
        code: 'custom',
        path: ['email'],
        message: 'Електронна пошта вже зайнята',
      })

      throw createError({
        statusCode: 422,
        message: 'Неправильні дані запиту',
        data: new z.ZodError(issues).flatten(),
      })
    }

    user.email = request.body.email
    user.emailVerifiedAt = null
  }

  if (request.body.password) {
    user.password = await hashPassword(event, request.body.password)
  }

  if (request.body.name) {
    user.name = request.body.name
  }

  if (request.body.surname) {
    user.surname = request.body.surname
  }

  await userRepository.save(user)

  return createProfileResource(user)
})
