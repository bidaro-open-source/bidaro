import { createPermissionResource, permissionRepository, permissionSource, roleSource } from '~~/server/domains/authorization'
import { updatePermissionPolicy } from './index.patch.policy'
import { updatePermissionRequest } from './index.patch.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  updatePermissionPolicy(event)

  const request = await updatePermissionRequest(event)

  const permission = await permissionRepository.findByPk(request.params.name)

  if (!permission) {
    throw createError({
      statusCode: 404,
      message: 'Право не знайдено',
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
