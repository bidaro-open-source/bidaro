import { randomUUID } from 'crypto'
import { Buffer } from 'node:buffer'
import * as fs from 'node:fs'

interface FileOption {
  path: string
  mime: string
  filename: string
}

export type MultipartConfig = ReturnType<typeof createMultipartConfig>

/**
 * Creates a configuration for fetch to upload files by multipart/form-data.
 *
 * There is a bug in bun where automatic fetch filling does not work when
 * transferring FormData to the body.
 *
 * @see Issue https://github.com/oven-sh/bun/issues/7917
 *
 * @param files file options
 * @returns multipart config for fetch
 */
export function createMultipartConfig(files: FileOption[]) {
  const boundary = `----bun-boundary-${randomUUID()}`

  const parts: Buffer[] = []

  for (const { path, mime, filename } of files) {
    const file = fs.readFileSync(path).buffer

    parts.push(
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(
        `Content-Disposition: form-data; name="files"; filename="${filename}"\r\n`,
      ),
      Buffer.from(`Content-Type: ${mime}\r\n\r\n`),
      Buffer.from(file),
      Buffer.from('\r\n'),
    )
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`))

  const body = Buffer.concat(parts)

  return {
    body,
    contentType: `multipart/form-data; boundary=${boundary}`,
  }
}
