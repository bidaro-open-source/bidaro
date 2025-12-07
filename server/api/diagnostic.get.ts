import { AppError } from '#classes/app-error'
import { HeadBucketCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)

  if (event.node.req.headers['x-diagnostic-token'] !== runtimeConfig.diagnostic.token) {
    throw new AppError('UNAUTHORIZED')
  }

  let databaseConnectionOk = false
  let databaseConnectionError: string | null = null

  try {
    await useDatabase().sequelize.authenticate()
    databaseConnectionOk = true
  }
  catch (error: any) {
    databaseConnectionOk = false
    databaseConnectionError = error.message ?? error
  }

  let redisConnectionOk = false
  let redisConnectionError: string | null = null

  try {
    await useRedis().ping()
    redisConnectionOk = true
  }
  catch (error: any) {
    redisConnectionOk = false
    redisConnectionError = error.message ?? error
  }

  let storageConnectionOk = false
  let storageConnectionError: string | null = null

  try {
    const { s3, Bucket } = useObjectStorage()
    await s3.send(new HeadBucketCommand({ Bucket }))
    storageConnectionOk = true
  }
  catch (error: any) {
    storageConnectionOk = false
    storageConnectionError = error.message ?? error
  }

  let nodemailerConnectionOk = false
  let nodemailerConnectionError: string | null = null

  try {
    await useNodemailer(event).verify()
    nodemailerConnectionOk = true
  }
  catch (error: any) {
    nodemailerConnectionOk = false
    nodemailerConnectionError = error.message ?? error
  }

  return {
    ok: databaseConnectionOk && redisConnectionOk && storageConnectionOk && nodemailerConnectionOk,
    database: {
      ok: databaseConnectionOk,
      error: databaseConnectionError,
    },
    redis: {
      ok: redisConnectionOk,
      error: redisConnectionError,
    },
    objectStorage: {
      ok: storageConnectionOk,
      error: storageConnectionError,
    },
    mailer: {
      ok: nodemailerConnectionOk,
      error: nodemailerConnectionError,
    },
  }
})
