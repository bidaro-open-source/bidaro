/* eslint antfu/no-top-level-await: 0 */

import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createUmzug } from './umzug'

export const seeder = createUmzug({
  directory: 'server/database/seeds',
  template: 'server/database/console/template-seed.ts',
  modelName: 'seeders',
})

export type Seeder = typeof seeder._types.migration

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await seeder.runAsCLI()
  process.exit(0)
}
