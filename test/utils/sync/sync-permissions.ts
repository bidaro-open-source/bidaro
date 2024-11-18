import { permissions } from '~/server/constants'
import type { Database } from '~/server/database'

export async function syncPermissions(db: Database) {
  await db.Permission.bulkCreate(
    Object.entries(permissions).map(property => ({ name: property[1] })),
  )
}
