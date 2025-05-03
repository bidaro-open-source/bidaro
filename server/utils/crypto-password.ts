import { compare, hash } from 'bcrypt'

/**
 * Creates a secure hash from a plain text password.
 *
 * @param event H3Event
 * @param password plain text password to hash
 * @returns securely hashed password string
 */
export function hashPassword(event: H3Event, password: string) {
  const runtimeConfig = useRuntimeConfig(event)

  return hash(password, +runtimeConfig.password.hashRounds)
}

/**
 * Verifies if a plain text password matches its hashed version.
 *
 * @param _ H3Event (unused)
 * @param password password plain text password to verify
 * @param hash hashed password to compare against
 * @returns true if password matches, false otherwise
 */
export function comparePassword(_: H3Event, password: string, hash: string) {
  return compare(password, hash)
}
