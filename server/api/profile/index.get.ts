import { createProfileResource } from '~~/server/resources/profile.resource'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  return createProfileResource(user)
})
