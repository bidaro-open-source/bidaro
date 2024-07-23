import crypto from 'node:crypto'

export type ResetToken = string

/**
 * Returns reset token.
 *
 * @param event H3Event
 * @returns random bytes
 */
export function createResetToken(event?: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  return crypto.randomBytes(+runtimeConfig.password.resetSize).toString('hex')
}
