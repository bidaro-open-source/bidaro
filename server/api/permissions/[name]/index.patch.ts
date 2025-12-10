import { createPermissionResource, permissionRepository, permissionSource, roleSource } from '#domains/authorization'
import { updatePermissionPolicy } from './index.patch.policy'
import { updatePermissionRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  updatePermissionPolicy(event)

  const request = await updatePermissionRequest(event)

  const permission = await permissionRepository.findByPk(request.params.name)

  if (!permission) {
    throw createAppError('PERMISSION_NOT_FOUND', {
      name: request.params.name,
    })
  }

  const displayName = Object.hasOwn(request.body, 'displayName')
    ? request.body.displayName
    : permission.displayName

  const description = Object.hasOwn(request.body, 'description')
    ? request.body.description
    : permission.description

  const updatedPermission = await permissionRepository.updateByPk(
    request.params.name,
    {
      displayName: displayName || null,
      description: description || null,
    },
  )

  await roleSource.invalidateAll()
  await permissionSource.invalidateAll()

  return createPermissionResource(updatedPermission)
})
