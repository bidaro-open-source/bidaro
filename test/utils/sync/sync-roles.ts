import { roles } from '~/server/constants'
import type { Database } from '~/server/database'

/**
 * Creates required roles in the empty database.
 *
 * @param db database object
 */
export async function syncRoles(db: Database) {
  await db.Role.bulkCreate(
    Object.entries(roles).map(property => ({ name: property[1] })),
  )
}
