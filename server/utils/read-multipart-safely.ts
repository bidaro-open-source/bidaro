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
 * @throws 413 if limits are exceeded.
 * @thorws 415 for invalid MIME types.
 * @throws 400 for parsing errors.
 */
export function readMultipartSafely(event: H3Event, options: MultipartOptions = {}): Promise<MultipartResult> {
  return new Promise((resolve, reject) => {
    const contentType = getRequestHeader(event, 'content-type')

    if (!contentType) {
      throw createError({
        statusCode: 400,
        message: 'Missing Content-Type header',
      })
    }

    if (!contentType.startsWith('multipart/form-data')) {
      throw createError({
        statusCode: 415,
        message: `Непідтримуваний Content-Type: ${contentType}`,
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
        createError({
          statusCode: 400,
          message: `Помилка ініціалізації парсера multipart даних: ${err.message}`,
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
        fileStream.resume()

        return reject(
          createError({
            statusCode: 415,
            message: `Тип файлу "${mimeType}" не підтримується`,
          }),
        )
      }

      const chunks: Buffer[] = []

      fileStream.on('data', chunk => chunks.push(chunk))

      fileStream.on('limit', () => {
        req.unpipe(busboy)
        reject(
          createError({
            statusCode: 413,
            message: `Файл "${filename}" перевищує допустимий розмір`,
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
        return reject(
          createError({
            statusCode: 413,
            message: 'Ім\'я поля перевищує допустиму довжину',
          }),
        )
      }

      if (info.valueTruncated) {
        req.unpipe(busboy)
        return reject(
          createError({
            statusCode: 413,
            message: `Поле "${fieldname}" перевищує допустимий розмір`,
          }),
        )
      }

      result.fields[fieldname] = val
    })

    busboy.on('close', () => {
      resolve(result)
    })

    busboy.on('error', (err: any) => {
      const clientErrors = [
        'Boundary not found',
        'Unexpected end of multipart data',
        'Unexpected end of form',
        'Multipart: Boundary not found',
      ]

      const isClientError = clientErrors.some(msg => err.message?.includes(msg))

      if (isClientError) {
        reject(
          createError({
            statusCode: 400,
            message: `Помилка розбору multipart даних: ${err.message}`,
          }),
        )
      }
      else {
        reject(
          createError({
            statusCode: 500,
            message: 'Внутрішня помилка сервера під час розбору multipart даних',
          }),
        )
      }
    })

    req.pipe(busboy)
  })
}
