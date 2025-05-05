import { z } from 'zod'
import { updateProfileRequest } from '~~/server/requests/profile/profile'
import { createProfileResource } from '~~/server/resources/profile-resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await validateRequest(event, updateProfileRequest)

  const user = getAuthenticatedUser(event)

  if (request.body.email) {
    const db = useDatabase()

    const userInDB = await db.User.findOne({
      where: { email: request.body.email },
    })

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

  await user.save()

  return createProfileResource(user)
})
