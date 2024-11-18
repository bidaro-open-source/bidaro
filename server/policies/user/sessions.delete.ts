export function deleteSessionsPolicy(event: H3Event, uid: number) {
  return event.context.auth.uid === uid
}
