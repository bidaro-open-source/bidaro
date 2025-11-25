import { createRoleResource, roleService } from '~~/server/domains/authorization'
import { createRolePolicy } from './index.policy'
import { createRoleRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await createRoleRequest(event)

  createRolePolicy(event)

  const role = await roleService.create(request.body)

  setResponseStatus(event, 201)

  return createRoleResource(role)
})
