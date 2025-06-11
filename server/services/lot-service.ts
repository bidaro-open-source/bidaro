const stepTable: [number, number, number][] = [
  [1.0, 5.0, 1.0],
  [5.0, 10.0, 2.0],
  [10.0, 20.0, 3.0],
  [20.0, 40.0, 5.0],
  [40.0, 60.0, 6.0],
  [60.0, 80.0, 8.0],
  [80.0, 100.0, 10.0],
  [100.0, 125.0, 12.0],
  [125.0, 150.0, 15.0],
  [150.0, 175.0, 18.0],
  [175.0, 200.0, 20.0],
  [200.0, 225.0, 22.0],
  [225.0, 250.0, 24.0],
  [250.0, 275.0, 26.0],
  [275.0, 300.0, 28.0],
  [300.0, 350.0, 30.0],
  [350.0, 400.0, 32.0],
  [400.0, 450.0, 34.0],
  [450.0, 500.0, 36.0],
  [500.0, 550.0, 38.0],
  [550.0, 600.0, 40.0],
  [600.0, 650.0, 42.0],
  [650.0, 700.0, 44.0],
  [700.0, 750.0, 46.0],
  [750.0, 900.0, 48.0],
  [900.0, 1000.0, 50.0],
  [1000.0, 1100.0, 55.0],
  [1100.0, 1200.0, 60.0],
  [1200.0, 1300.0, 65.0],
  [1300.0, 1500.0, 70.0],
  [1500.0, 1600.0, 75.0],
  [1600.0, 1700.0, 80.0],
  [1700.0, 1900.0, 85.0],
  [1900.0, 2000.0, 90.0],
  [2000.0, 2250.0, 95.0],
  [2250.0, 2500.0, 100.0],
  [2500.0, 2750.0, 105.0],
  [2750.0, 3000.0, 110.0],
  [3000.0, 3250.0, 120.0],
  [3250.0, 3500.0, 150.0],
  [3500.0, 4000.0, 175.0],
  [4000.0, 5000.0, 200.0],
  [5000.0, 6000.0, 220.0],
  [6000.0, 7000.0, 240.0],
  [7000.0, 8000.0, 280.0],
  [8000.0, 9000.0, 300.0],
  [9000.0, 10000.0, 350.0],
  [10000.0, Infinity, 400.0],
]

/**
 * Calculate the minimal step for the lot based on the amount of the
 * latest bet.
 *
 * @param amount amount of the latest bet
 */
export function calcualteLotMinimalStep(amount: number) {
  for (const [min, max, step] of stepTable) {
    if (amount >= min && amount < max) {
      return step
    }
  }

  throw new Error(`Amount is out of range ${amount}.`)
}
/**
 * Calculate the interval for the lot based on the text duration.
 *
 * @param duration duration of the lot by text value
 */
export function calculateLotIntervals(duration: string) {
  const durationInMs = calculateLotDuration(duration)

  return {
    effectiveDate: new Date(),
    expirationDate: new Date(Date.now() + durationInMs),
  }
}

/**
 * Calculate the interval in ms for the lot based on the text duration.
 *
 * @param duration duration of the lot by text value
 * @returns duration in milliseconds
 */
export function calculateLotDuration(duration: string): number {
  switch (duration) {
    case '1_hour':
      return 3600000
    case '1_day':
      return 86400000
    case '3_days':
      return 259200000
    case '7_days':
      return 604800000
    default:
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: `Unknown duration: ${duration}`,
      })
  }
}
