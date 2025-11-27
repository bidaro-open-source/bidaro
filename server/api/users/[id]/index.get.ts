import { userResource, userSource } from '~~/server/domains/users'
import { viewUserRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await viewUserRequest(event)

  const user = await userSource.getByPk(request.params.id)

  return userResource.make(user)
})
