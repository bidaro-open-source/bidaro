import { compare, hash } from 'bcrypt'

/**
 * Creates a secure hash from a plain text password.
 *
 * @param password plain text password to hash
 * @returns securely hashed password string
 */
export function hashPassword(password: string) {
  const runtimeConfig = useRuntimeConfig()

  return hash(password, +runtimeConfig.password.hashRounds)
}

/**
 * Verifies if a plain text password matches its hashed version.
 *
 * @param password password plain text password to verify
 * @param hash hashed password to compare against
 * @returns true if password matches, false otherwise
 */
export function comparePassword(password: string, hash: string) {
  return compare(password, hash)
}
