import { createUserResource, userSource } from '~~/server/modules/users'
import { getUserRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await getUserRequest(event)

  const user = await userSource.getById(request.params.id)

  return createUserResource(user)
})
