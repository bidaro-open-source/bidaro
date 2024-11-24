import { getPermissionsPolicy } from '~/server/policies/permissions'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, getPermissionsPolicy)

  const db = useDatabase()

  return await db.Permission.findAll()
})
