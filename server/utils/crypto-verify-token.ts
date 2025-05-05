import crypto from 'node:crypto'

export type EmailVerifyToken = string

/**
 * Returns reset token.
 *
 * @param event H3Event
 * @returns random bytes
 */
export function createVerifyToken(event?: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  return crypto.randomBytes(+runtimeConfig.email.tokenSize).toString('hex')
}
