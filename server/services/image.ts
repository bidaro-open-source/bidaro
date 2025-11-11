import type { Image } from '../database'
import * as path from 'node:path'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

interface UploadPayload {
  data: any
  type?: string
  filename?: string
}

interface ErrorHandling {
  ok: boolean
  id: number
  cause?: string
}

export const imageService = {
  /**
   * Simple utils for image service.
   *
   * @param data multipart data
   * @returns metadata values
   */
  getMeta(data: UploadPayload) {
    const extension = path.extname(data.filename || '').toLowerCase()
    const size = data.data?.length || 0
    const type = data.type || 'application/octet-stream'
    const key = `${uuidv4()}${extension}`

    return { size, type, key }
  },

  /**
   * Uploads one image to s3 and creates recond in database.
   *
   * This function follows a "create-then-upload" pattern with rollback.
   *
   * 1. Creates an `Image` record in the database with a generated S3 key.
   * 2. Attempts to upload the file to S3 using the generated key.
   * 3. **On S3 success:** Returns the created database record.
   * 4. **On S3 failure:** Deletes the database record (rollback) and throws an error.
   * 5. **On rollback delete failure:** Throw an error (record stay in db)
   *
   * @param data multipart data
   * @returns Image instance
   */
  async upload(data: UploadPayload) {
    const db = useDatabase()
    const { s3, Bucket } = useObjectStorage()
    const { size, type, key } = imageService.getMeta(data)

    let image: Image | null = null

    try {
      image = await db.Image.create({
        bucket: Bucket,
        mime_type: type,
        size_bytes: size,
        key,
      })
    }
    catch (error) {
      throw createError({
        message: 'Помилка сервера під час додавання зображення до бази даних',
        status: 500,
        cause: error,
      })
    }

    try {
      const s3Command = new PutObjectCommand({
        Key: key,
        Body: data.data,
        ContentType: type,
        ContentLength: size,
        ACL: 'public-read',
        Bucket,
      })

      await s3.send(s3Command)

      return image
    }
    catch (error) {
      try {
        await image.destroy()
      }
      catch (rollbackError) {
        throw createError({
          message: 'Критична помилка сервера під час завантаження зображення',
          status: 500,
          cause: rollbackError,
        })
      }

      console.log(error)

      throw createError({
        message: 'Помилка сервера під час завантаження зображення',
        status: 500,
        cause: error,
      })
    }
  },

  /**
   * Deletes image in s3 and database and throw an error if exists.
   *
   * @param imageId image primary key
   * @returns Image instance
   */
  async destory(imageId: number) {
    const result = await safeDeleteImage(imageId)

    if (!result.ok) {
      throw createError({
        message: 'Зображення не видалено',
        status: 500,
        cause: result.cause,
      })
    }
  },

  /**
   * Deletes images in s3 and database and returns result for every image.
   *
   * @param imageIds image primary keys
   * @returns array of results
   */
  async destorySafely(imageIds: number[]) {
    const deletionPromises = imageIds.map(id => safeDeleteImage(id))

    const results = await Promise.all(deletionPromises)

    return results
  },
}

/**
 * Deletes image in s3 and database without throw
 *
 * @param imageId image primary key
 * @returns Image instance
 */
async function safeDeleteImage(imageId: number): Promise<ErrorHandling> {
  const db = useDatabase()
  const { s3 } = useObjectStorage()

  const result: ErrorHandling = { ok: false, id: imageId }

  const image = await db.Image.findByPk(imageId)

  if (!image) {
    result.cause = 'Зображення не знайдено'

    return result
  }

  try {
    const s3Command = new DeleteObjectCommand({
      Bucket: image.bucket,
      Key: image.key,
    })

    await s3.send(s3Command)
  }
  catch (error) {
    result.cause = 'Зображення не вдалося видалити зі сховища об\'єктів'

    return result
  }

  try {
    await image.destroy()
  }
  catch (error) {
    result.cause = 'Зображення не вдалося видалити з бази даних'

    return result
  }

  result.ok = true

  return result
}
