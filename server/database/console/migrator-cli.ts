/* eslint antfu/no-top-level-await: 0 */

import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createUmzug } from './umzug'

export const migrator = createUmzug({
  directory: 'server/database/migrations',
  template: 'server/database/console/template-migration.ts',
  modelName: 'migrations',
})

export type Migration = typeof migrator._types.migration

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await migrator.runAsCLI()
  process.exit(0)
}
