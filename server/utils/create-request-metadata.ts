export interface RequestMetadata {
  date?: Date
  ua?: string
  ip?: string
}

/**
 * Generates request metadata from the request event.
 *
 * @param event H3Event
 * @returns request metadata
 */
export function createRequestMetadata(event: H3Event): RequestMetadata {
  return {
    date: new Date(),
    ip: getRequestIP(event),
    ua: getRequestHeader(event, 'user-agent'),
  }
}
