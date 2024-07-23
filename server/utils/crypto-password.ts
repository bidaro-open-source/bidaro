import { compare, hash } from 'bcrypt'

export function hashPassword(event: H3Event, password: string) {
  const runtimeConfig = useRuntimeConfig(event)

  return hash(password, +runtimeConfig.password.hashRounds)
}

export function comparePassword(_: H3Event, password: string, hash: string) {
  return compare(password, hash)
}
