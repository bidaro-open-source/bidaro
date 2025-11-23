import { z } from 'zod'
import { userRepository } from '~~/server/repositories/user.repository'
import { createUserResource } from '~~/server/resources/user.resource'
import { createUserPolicy } from './index.policy'
import { createUserRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await createUserRequest(event)

  createUserPolicy(event)

  const userByEmail = await userRepository.findByEmail(request.body.email)
  const userByUsername = await userRepository.findByUsername(request.body.username)

  if (userByEmail || userByUsername) {
    const issues: z.core.$ZodIssueCustom[] = []

    if (userByEmail) {
      issues.push({
        code: 'custom',
        path: ['email'],
        message: 'Електронна пошта вже зайнята',
      })
    }

    if (userByUsername) {
      issues.push({
        code: 'custom',
        path: ['username'],
        message: 'Ім\'я користувача вже зайняте',
      })
    }

    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: z.flattenError(new z.ZodError(issues)),
    })
  }

  const user = await userRepository.create({
    email: request.body.email,
    username: request.body.username,
    password: await hashPassword(request.body.password),
    roleName: request.body.roleName || null,
  })

  setResponseStatus(event, 201)

  return createUserResource(user)
})
