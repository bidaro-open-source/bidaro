import type { H3Event } from 'h3'

/**
 * Alias for loading user data by access token.
 *
 * @param event H3Event
 * @returns user data
 * @throws if event context not contain user id or db not contain user.
 */
export default async function (event: H3Event) {
  const uid = event.context.auth.uid

  if (!uid)
    throw new Error(`User id not exists in context. Use mustBeAuthenticated().`)

  const user = await useDatabase(event).User.findByPk(uid)

  if (!user)
    throw new Error(`User not found by id: ${uid}. Something went wrong.`)

  return user
}
