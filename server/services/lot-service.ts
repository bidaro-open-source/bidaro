/**
 * Calculate the interval in ms for the lot based on the text duration.
 *
 * @param duration duration of the lot by text value
 * @returns duration in milliseconds
 */
export function calculateInterval(duration: string): number {
  switch (duration) {
    case '1_hour':
      return 1 * 60 * 60 * 1000
    case '1_day':
      return 24 * 60 * 60 * 1000
    case '3_days':
      return 3 * 24 * 60 * 60 * 1000
    case '7_days':
      return 7 * 24 * 60 * 60 * 1000
    default:
      throw new Error(`Unknown duration: ${duration}`)
  }
}

/**
 * Calculate the interval in ms for the lot based on the text duration.
 *
 * @param duration duration of the lot by text value
 * @returns duration in milliseconds
 */
export function normalizeInterval(duration: number): string {
  switch (`${duration}`) {
    case `${1 * 60 * 60 * 1000}`:
      return '1_hour'
    case `${24 * 60 * 60 * 1000}`:
      return '1_day'
    case `${3 * 24 * 60 * 60 * 1000}`:
      return '3_days'
    case `${7 * 24 * 60 * 60 * 1000}`:
      return '7_days'
    default:
      throw new Error(`Unknown duration: ${duration}`)
  }
}
