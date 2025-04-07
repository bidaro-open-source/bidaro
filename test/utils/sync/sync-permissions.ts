import type { Database } from '~/server/database'
import { permissions } from '~/server/constants'

/**
 * Creates required permissions in the empty database.
 *
 * @param db database object
 */
export async function syncPermissions(db: Database) {
  await db.Permission.bulkCreate(
    Object.entries(permissions).map(property => ({ name: property[1] })),
  )
}
