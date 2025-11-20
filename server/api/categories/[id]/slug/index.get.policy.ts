import { permissions } from '~~/server/constants'

export const updateCategorySlugPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.UPDATE_CATEGORY_SLUG)
})
