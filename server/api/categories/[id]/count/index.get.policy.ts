import { permissions } from '~~/server/constants'

export const viewCategoryCountPolicy = createRequestPolicy((event: H3Event) => {
  const userPermissions = getAuthenticatedUserPermissions(event)
  if (!userPermissions)
    return false
  return hasPermission(userPermissions, permissions.VIEW_CATEGORY_COUNT)
})
