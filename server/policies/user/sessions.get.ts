export function getSessionsPolicy(event: H3Event, uid: number) {
  return event.context.auth.uid === uid
}
