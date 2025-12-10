import type { H3Event } from 'h3'

/**
 * Configuration options for the rate limiter utility.
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed for unauthenticated users within the duration. */
  anonymousLimit?: number
  /** Maximum number of requests allowed for authenticated users within the duration. */
  authenticatedLimit?: number
  /** The time window in seconds for the rate limit. Defaults to 120 seconds. */
  duration?: number
}

/**
 * Lua script to perform atomic rate limiting operations.
 * 1. Increments the counter.
 * 2. Sets expiration if the counter is new (equals 1).
 * 3. Returns the current count and the remaining TTL.
 */
const RATE_LIMIT_SCRIPT = `
  local current = redis.call("INCR", KEYS[1])
  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end
  local ttl = redis.call("TTL", KEYS[1])
  return {current, ttl}
`

/**
 * Enforces rate limiting on the current request.
 *
 * @param event - The current H3 event context.
 * @param config - The rate limit configuration object.
 * @returns A promise that resolves if the request is within limits.
 * @throws TOO_MANY_REQUESTS
 * @throws TOO_MANY_REQUESTS_ANONYMOUS
 */
export async function useRateLimiter(
  event: H3Event,
  config: RateLimitConfig = {},
) {
  const runtimeConfig = useRuntimeConfig()

  if (!runtimeConfig.rateLimit.enabled) {
    return
  }

  const authenticatedLimit = config.authenticatedLimit ?? 0
  const anonymousLimit = config.anonymousLimit ?? 0
  const duration = config.duration ?? 120

  const user = getAuthenticatedUser(event)

  const isAuth = !!user && !!user.id

  const limit = isAuth ? authenticatedLimit : anonymousLimit

  let isLimited = true
  let xRatelimitRemaining = 0
  let xRatelimitLimit = 0
  let xRatelimitReset = 0
  let retryAfter = 0

  if (limit > 0) {
    const redis = useRedis()

    const key = isAuth
      ? `rate:${event.method}:${event.path}:${user.id}`
      : `rate:${event.method}:${event.path}`

    const [currentCount, ttl] = await redis.eval(
      RATE_LIMIT_SCRIPT,
      1,
      key,
      duration,
    ) as [number, number]

    const effectiveTtl = ttl > 0 ? ttl : duration
    const remaining = Math.max(0, limit - currentCount)
    const resetTime = Math.floor(Date.now() / 1000) + effectiveTtl

    isLimited = remaining <= 0
    xRatelimitRemaining = remaining
    xRatelimitLimit = limit
    xRatelimitReset = resetTime
    retryAfter = effectiveTtl
  }

  setResponseHeader(event, 'x-ratelimit-remaining', xRatelimitRemaining)
  setResponseHeader(event, 'x-ratelimit-limit', xRatelimitLimit)
  setResponseHeader(event, 'x-ratelimit-reset', xRatelimitReset)

  if (isLimited) {
    setResponseHeader(event, 'retry-after', retryAfter)

    throw createAppError(isAuth ? 'TOO_MANY_REQUESTS' : 'TOO_MANY_REQUESTS_ANONYMOUS')
  }
}
