/**
 * Throws an nuxt error if the request is not authorized.
 *
 * @param event H3Event
 * @param policy policy function
 * @param args policy arguments
 */
export default function<Policy extends (...args: any[]) => any>(
  event: H3Event,
  policy: Policy,
  ...args: Parameters<Policy> extends [H3Event, ...infer P] ? P : never
): void {
  if (!policy(event, ...args)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Немає доступу',
    })
  }
}
