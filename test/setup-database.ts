import { afterAll, beforeAll } from 'vitest'
import { useDatabase } from './utils/use-database'

beforeAll(() => {
  // @ts-expect-error type
  globalThis.db = useDatabase()
})

afterAll(async () => {
  // @ts-expect-error type
  await globalThis.db.sequelize.close()
  // @ts-expect-error type
  delete globalThis.db
})

declare global {
  let db: ReturnType<typeof useDatabase>
}
