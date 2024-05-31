import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
  const storage = useStorage()
  const runtimeConfig = useRuntimeConfig()

  const driver = redisDriver({
    tls: false as any,
    host: runtimeConfig.redis.host,
    port: +runtimeConfig.redis.port,
    username: runtimeConfig.redis.user,
    password: runtimeConfig.redis.pass,
  })

  storage.mount('redis', driver)
})
