export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  deleteCookie(event, 'jwt')

  return { ok: true }
})
