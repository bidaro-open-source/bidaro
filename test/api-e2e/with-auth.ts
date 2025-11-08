export function withAuth(accessToken: string | null | undefined, headers: HeadersInit = {}): HeadersInit {
  if (!accessToken)
    return headers
  return {
    Authorization: `Bearer ${accessToken}`,
    ...headers,
  }
}
