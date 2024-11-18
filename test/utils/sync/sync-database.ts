import type { Database } from '~/server/database'

/**
 * Creates required tabel in the database.
 *
 * @param db database object
 */
export async function syncDatabase(db: Database) {
  await db.sequelize.sync({ force: true })
}
