import crypto from 'node:crypto'

export type RefreshToken = string

/**
 * Returns refresh token.
 *
 * @param event H3Event
 * @returns random bytes
 */
export function createRefreshToken(event?: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  return crypto.randomBytes(+runtimeConfig.jwt.refreshSize).toString('hex')
}
