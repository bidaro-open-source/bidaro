import type { Database, DatabaseWithFactories } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { Sequelize } from 'sequelize'
import { SequelizeStorage, Umzug } from 'umzug'
import { BootstrapDatabase, BootstrapFactories } from '../bootstrap'

interface UmzugOptions {
  directory: string
  modelName: string
  template: string
}

export function createUmzug(options: UmzugOptions) {
  const ROOT_DIR = path.join(__dirname, '..', '..', '..')
  const TARGET_DIR = path.join(ROOT_DIR, options.directory)
  const TEMPLATE_FILE = path.join(ROOT_DIR, options.template)
  const GLOB = path.join(TARGET_DIR, '[0-9]*.ts')

  const connection = new Sequelize({
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || ''),
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_CONNECTION as any,
    logging: false,
  })

  const database: Database = BootstrapDatabase(connection)

  const context: DatabaseWithFactories = BootstrapFactories(database)

  return new Umzug({
    migrations: { glob: GLOB },
    create: {
      folder: TARGET_DIR,
      template: filepath => [
        [filepath, fs.readFileSync(TEMPLATE_FILE).toString()],
      ],
    },
    context,
    storage: new SequelizeStorage({
      sequelize: context.sequelize,
      modelName: `${options.modelName}_meta`,
    }),
    logger: {
      info: (message: any) => {
        const gray = '\x1B[90m'
        const green = '\x1B[32m'
        const white = '\x1B[37m'
        const reset = '\x1B[0m'

        if (typeof message !== 'object' || message === null) {
          console.log(`${gray}[info] ${message}${reset}`)
          return
        }

        const highlightEvents = ['up', 'down', 'reverted', 'migrated']
        const isHighlight = highlightEvents.includes(message.event)
        const textColor = isHighlight ? white : gray
        const valueColor = isHighlight ? green : gray
        const parts = []

        for (const key in message) {
          if (Object.prototype.hasOwnProperty.call(message, key)) {
            const event = `${textColor}${key}${reset}`
            const value = `${valueColor}${message[key]}${reset}`
            parts.push(`${event}: ${value}`)
          }
        }

        console.log(`${gray}[INFO]${reset} ${parts.join(`${gray}, ${reset}`)}`)
      },
      warn: message => console.warn(message),
      error: message => console.error(message),
      debug: message => console.debug(message),
    },
  })
}
