import type { H3Event } from 'h3'

/**
 * One day in seconds (24 * 60 * 60).
 */
const ONE_DAY_IN_SECONDS = 86400

/**
 * Lua script to perform atomic action limit check and increment.
 * 1. Gets the current count for the action key.
 * 2. If key doesn't exist, defaults to 0.
 * 3. If count >= limit, returns 0 (limit exceeded).
 * 4. Otherwise, increments the counter and sets TTL if new key.
 * 5. Returns 1 (success).
 *
 * KEYS[1] = action key
 * ARGV[1] = limit
 * ARGV[2] = duration in seconds
 */
const ACTION_LIMIT_CHECK_SCRIPT = `
  local current = redis.call("GET", KEYS[1])
  if current == false then
    current = 0
  else
    current = tonumber(current)
  end
  if current >= tonumber(ARGV[1]) then
    return 0
  end
  local newValue = redis.call("INCR", KEYS[1])
  if newValue == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[2])
  end
  return 1
`

/**
 * Lua script to decrement the action counter on error rollback.
 * Only decrements if the key exists.
 *
 * KEYS[1] = action key
 */
const ACTION_LIMIT_DECREMENT_SCRIPT = `
  if redis.call("EXISTS", KEYS[1]) == 1 then
    redis.call("DECR", KEYS[1])
  end
  return 1
`

/**
 * Uses an action limiter to enforce per-user action limits.
 *
 * This utility ensures:
 * - Atomic check-and-increment for competitive parallel requests
 * - Automatic rollback on callback failure (failed operations don't consume quota)
 * - Redis failure handling with application-level errors
 *
 * Must be used after `mustBeAuthenticated` as limits are per authenticated user.
 *
 * @param event - The H3 event context
 * @param actionKey - Unique key identifying the action type
 * @param limit - Maximum number of actions allowed within the duration
 * @param callback - Async function to execute if within limits
 * @param duration - Time window in seconds (defaults to one day)
 * @returns Result of the callback function
 *
 * @throws 429 Too Many Requests if limit is exceeded
 * @throws 500 Internal Server Error if Redis operation fails
 *
 * @example
 * // Limit lot creation to 6 per day
 * export default defineEventHandler(async (event) => {
 *   mustBeAuthenticated(event)
 *   const user = getAuthenticatedUser(event)
 *
 *   return await useActionLimiter(event, 'create_lot', 6, async () => {
 *     return await lotService.createDraft(user.id)
 *   })
 * })
 */
export async function useActionLimiter<T>(
  event: H3Event,
  actionKey: string,
  limit: number,
  callback: () => Promise<T>,
  duration: number = ONE_DAY_IN_SECONDS,
): Promise<T> {
  const user = getAuthenticatedUser(event)
  const redis = useRedis()

  const key = `action_limit:${actionKey}:${user.id}`

  // Stage 1: Pre-execution limit check
  let allowed: number
  try {
    allowed = await redis.eval(
      ACTION_LIMIT_CHECK_SCRIPT,
      1,
      key,
      limit,
      duration,
    ) as number
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Операція з Redis не вдалася',
      data: error,
    })
  }

  if (allowed === 0) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Ліміт дій перевищено. Будь ласка, спробуйте пізніше.',
    })
  }

  // Execute the callback with error rollback
  try {
    return await callback()
  }
  catch (error) {
    // Stage 2: Error rollback - decrement the counter
    try {
      await redis.eval(
        ACTION_LIMIT_DECREMENT_SCRIPT,
        1,
        key,
      )
    }
    catch {
      // Ignore rollback errors, but still propagate the original error
    }

    throw error
  }
}
