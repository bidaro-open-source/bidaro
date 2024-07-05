import { Redis } from 'ioredis'

export default function () {
  const runtimeConfig = useRuntimeConfig()

  return new Redis({
    host: runtimeConfig.redis.host,
    port: +runtimeConfig.redis.port,
    username: runtimeConfig.redis.user,
    password: runtimeConfig.redis.pass,
  })
}
