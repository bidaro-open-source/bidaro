import { AppError } from '#classes/app-error'
import { userRepository, userResource } from '#domains/users'
import { createUserPolicy } from './index.policy'
import { createUserRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 20,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await createUserRequest(event)

  createUserPolicy(event)

  const userByEmail = await userRepository.findByEmail(request.body.email)
  const userByUsername = await userRepository.findByUsername(request.body.username)

  if (userByEmail || userByUsername) {
    const fieldErrors: Record<string, string[]> = {}

    if (userByEmail) {
      fieldErrors.email = ['Електронна пошта вже зайнята']
    }

    if (userByUsername) {
      fieldErrors.username = ['Ім\'я користувача вже зайняте']
    }

    throw new AppError('VALIDATION_ERROR', { fieldErrors })
  }

  const user = await userRepository.create({
    email: request.body.email,
    username: request.body.username,
    password: await hashPassword(request.body.password),
    roleName: request.body.roleName || null,
  })

  setResponseStatus(event, 201)

  return userResource.make(user)
})
