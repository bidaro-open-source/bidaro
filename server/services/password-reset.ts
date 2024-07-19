import { v4 as uuidv4 } from 'uuid'

export const REDIS_PASSWORD_RESET_NAMESPACE = 'password-reset-token'

/**
 * Generates token.
 *
 * @param resetToken refresh token
 * @returns user id
 */
export async function getUserIdByResetToken(
  resetToken: string,
): Promise<number | null> {
  const redis = useRedis()

  const data = await redis.get(
    `${REDIS_PASSWORD_RESET_NAMESPACE}:${resetToken}`,
  )

  return Number.isInteger(Number(data)) ? Number(data) : null
}

/**
 * Generates token.
 *
 * @param uid user id
 * @returns token for reset password
 */
export async function createPasswordResetToken(
  uid: number,
): Promise<string> {
  const redis = useRedis()

  const token = uuidv4()

  await redis.set(
    `${REDIS_PASSWORD_RESET_NAMESPACE}:${token}`,
    uid,
    'EX',
    86400,
  )

  return token
}

/**
 * Generates token.
 *
 * @param resetToken refresh token
 * @returns user session data
 */
export async function deletePasswordResetToken(
  resetToken: string,
): Promise<void> {
  await useRedis().del(`${REDIS_PASSWORD_RESET_NAMESPACE}:${resetToken}`)
}
