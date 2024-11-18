import type { Database } from '~/server/database'

export async function syncDatabase(db: Database) {
  await db.sequelize.sync({ force: true })
}
