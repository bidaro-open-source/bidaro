import { Buffer } from 'node:buffer'
import Busboy from 'busboy'

/**
 * Configuration options for the multipart parser.
 * Defines security constraints and validation rules.
 */
interface MultipartOptions {
  /**
   * Whitelist of allowed MIME types (e.g., ['image/jpeg', 'application/pdf']).
   * If not provided, all types are accepted.
   */
  allowedMimeTypes?: string[]
  /**
   * Byte limits for the parser to prevent DoS attacks.
   */
  limits?: {
    /** Maximum size of a single file in bytes. Default: 5MB. */
    fileSize?: number
    /** Maximum number of files allowed in the request. Default: 0. */
    files?: number
    /** Maximum size of a text field value in bytes. Default: 1KB. */
    fieldSize?: number
    /** Maximum number of text fields allowed. Default: 0. */
    fields?: number
  }
}

/**
 * Represents a processed file from the multipart request.
 */
interface UploadedFile {
  fieldname: string
  filename: string
  mimetype: string
  buffer: Buffer
}

/**
 * Result of the multipart parsing operation.
 */
interface MultipartResult {
  /** Key-value pairs of text fields found in the request. */
  fields: Record<string, string>
  /** Array of uploaded files containing buffers and metadata. */
  files: UploadedFile[]
}

/**
 * Securely parses a multipart/form-data request using Busboy.
 *
 * This utility enforces strict limits on file sizes, field sizes, and file counts
 * to prevent RAM exhaustion and DoS attacks. It buffers files into memory
 * but aborts immediately if limits are exceeded.
 *
 * @param event - The H3 event object containing the request.
 * @param options - Configuration for limits and allowed MIME types.
 * @returns A promise that resolves to an object containing fields and files.
 * @throws MISSING_CONTENT_TYPE - When Content-Type header is missing
 * @throws UNSUPPORTED_MEDIA_TYPE - When Content-Type is not multipart/form-data or file type not allowed
 * @throws PAYLOAD_TOO_LARGE - When file or field size exceeds limits
 * @throws FIELD_NAME_TOO_LONG - When field name exceeds maximum length
 * @throws INVALID_MULTIPART_DATA - When multipart parsing fails
 * @throws INTERNAL_SERVER_ERROR - When unexpected server error occurs
 */
export function readMultipartSafely(event: H3Event, options: MultipartOptions = {}): Promise<MultipartResult> {
  return new Promise((resolve, reject) => {
    const contentType = getRequestHeader(event, 'content-type')

    if (!contentType) {
      throw createAppError('MISSING_CONTENT_TYPE')
    }

    if (!contentType.startsWith('multipart/form-data')) {
      throw createAppError('UNSUPPORTED_MEDIA_TYPE', {
        contentType,
      })
    }

    const req = event.node.req

    let busboy: Busboy.Busboy

    try {
      busboy = Busboy({
        headers: req.headers,
        limits: {
          fileSize: options.limits?.fileSize ?? 5 * 1024 * 1024,
          files: options.limits?.files ?? 0,
          fieldSize: options.limits?.fieldSize ?? 1 * 1024,
          fields: options.limits?.fields ?? 0,
        },
      })
    }
    catch (err: any) {
      return reject(
        createAppError('INVALID_MULTIPART_DATA', {
          error: err.message,
        }),
      )
    }

    const result: MultipartResult = {
      fields: {},
      files: [],
    }

    busboy.on('file', (fieldname, fileStream, info) => {
      const { filename, mimeType } = info

      if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(mimeType)) {
        req.unpipe(busboy)
        req.resume()

        return reject(
          createAppError('UNSUPPORTED_MEDIA_TYPE', {
            mimeType,
          }),
        )
      }

      const chunks: Buffer[] = []

      fileStream.on('data', chunk => chunks.push(chunk))

      fileStream.on('limit', () => {
        req.unpipe(busboy)
        req.resume()
        reject(
          createAppError('PAYLOAD_TOO_LARGE', {
            filename,
          }),
        )
      })

      fileStream.on('end', () => {
        result.files.push({
          fieldname,
          filename,
          mimetype: mimeType,
          buffer: Buffer.concat(chunks),
        })
      })
    })

    busboy.on('field', (fieldname, val, info) => {
      const forbiddenFieldNames = ['__proto__', 'constructor', 'prototype']

      if (forbiddenFieldNames.includes(fieldname)) {
        return
      }

      if (fieldname.length > 100) {
        req.unpipe(busboy)
        req.resume()
        return reject(
          createAppError('FIELD_NAME_TOO_LONG', {
            field: fieldname,
          }),
        )
      }

      if (info.valueTruncated) {
        req.unpipe(busboy)
        req.resume()

        return reject(
          createAppError('PAYLOAD_TOO_LARGE', {
            field: fieldname,
          }),
        )
      }

      result.fields[fieldname] = val
    })

    busboy.on('close', () => {
      resolve(result)
    })

    busboy.on('error', (error: any) => {
      const clientErrors = [
        'Boundary not found',
        'Unexpected end of multipart data',
        'Unexpected end of form',
        'Multipart: Boundary not found',
      ]

      const isClientError = clientErrors.some(msg => error.message?.includes(msg))

      if (isClientError) {
        reject(
          createAppError('INVALID_MULTIPART_DATA', {
            error: error.message,
          }),
        )
      }
      else {
        logger.error('Unknown error during reading multipart safely', error)

        reject(
          createAppError('INTERNAL_SERVER_ERROR'),
        )
      }
    })

    req.pipe(busboy)
  })
}
