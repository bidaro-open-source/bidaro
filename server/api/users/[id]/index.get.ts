import { createUserResource, userSource } from '~~/server/domains/users'
import { getUserRequest } from './index.request'

export default defineEventHandler(async (event) => {
  const request = await getUserRequest(event)

  const user = await userSource.getByPk(request.params.id)

  return createUserResource(user)
})
