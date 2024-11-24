import { getRolesPolicy } from '~/server/policies/roles'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  mustBeAuthorized(event, getRolesPolicy)

  const db = useDatabase()

  return await db.Role.findAll()
})
