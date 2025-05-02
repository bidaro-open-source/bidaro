export interface RequestMetadata {
  date?: string
  ua?: string
  ip?: string
}

/**
 * Generates request metadata from the request event.
 *
 * @param event H3Event
 * @returns request metadata
 */
export default function (event: H3Event): RequestMetadata {
  return {
    date: new Date().toString(),
    ip: getRequestIP(event),
    ua: getRequestHeader(event, 'user-agent'),
  }
}
