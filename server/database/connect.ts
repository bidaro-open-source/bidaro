import { Sequelize } from 'sequelize'

const runtimeConfig = useRuntimeConfig()

export const sequelize = new Sequelize({
  host: runtimeConfig.db.host,
  port: +runtimeConfig.db.port,
  database: runtimeConfig.db.database,
  username: runtimeConfig.db.username,
  password: runtimeConfig.db.password,
  dialect: runtimeConfig.db.connection as any,
})
