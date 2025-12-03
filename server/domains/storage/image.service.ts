import type { Buffer } from 'node:buffer'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

class ImageService {
  /**
   * Maximum allowed image resolution (width or height).
   */
  readonly maxResolution = 8192

  /**
   * Allowed image formats.
   */
  readonly allowedFormats = ['jpeg', 'png', 'webp']

  /**
   * Gets image metadata.
   *
   * @param buffer image buffer
   * @returns image metadata or error message
   */
  async getMetadata(buffer: Buffer) {
    try {
      const metadata = await sharp(buffer).metadata()

      if (!metadata.format || !metadata.width || !metadata.height) {
        throw new Error('Unable to determine image format or dimensions')
      }

      return { metadata, error: null }
    }
    catch (error: any) {
      return { metadata: null, error: error.message as string }
    }
  }

  /**
   * Validates image buffer.
   *
   * @param buffer image buffer
   * @returns validated buffer or error message
   */
  async validateBuffer(buffer: Buffer) {
    try {
      const metadata = await sharp(buffer).metadata()

      if (!metadata.format || !metadata.width || !metadata.height) {
        throw new Error('Unable to determine image format or dimensions')
      }

      if (!this.allowedFormats.includes(metadata.format as keyof sharp.FormatEnum)) {
        throw new Error(`Format "${metadata.format}" is not allowed. Allowed: ${this.allowedFormats.join(', ')}`)
      }

      if (metadata.width > this.maxResolution || metadata.height > this.maxResolution) {
        throw new Error(`Image is too large (${metadata.width}x${metadata.height}). Max dimension allowed: ${this.maxResolution}px`)
      }

      if (metadata.width === 0 || metadata.height === 0) {
        throw new Error('Image has zero dimensions')
      }

      return { buffer, error: null }
    }
    catch (error: any) {
      return { buffer: null, error: error.message as string }
    }
  }

  /**
   * Compresses image buffer to AVIF format.
   *
   * @param buffer image buffer
   * @returns compressed buffer or error message
   */
  async compressBuffer(buffer: Buffer) {
    try {
      const compressedBuffer = await sharp(buffer)
        .avif({
          quality: 30,
          effort: 0,
        })
        .toBuffer()

      return { buffer: compressedBuffer, error: null }
    }
    catch (error: any) {
      return { buffer: null, error: error.message as string }
    }
  }

  /**
   * Uploads one image to s3 and creates record in database.
   *
   * @param buffer image buffer
   * @returns Image instance
   * @throws 400 if image is invalid
   */
  async upload(buffer: Buffer) {
    const db = useDatabase()
    const { s3, Bucket } = useObjectStorage()

    return await useDatabaseTransaction(async (transaction) => {
      const validatedImage = await this.validateBuffer(buffer)

      if (!validatedImage.buffer) {
        throw createError({
          message: `Невірний файл зображення: ${validatedImage.error}`,
          status: 400,
        })
      }

      const compressedImage = await this.compressBuffer(validatedImage.buffer)

      if (!compressedImage.buffer) {
        logger.warn('Image compression failed, proceeding with original buffer:', compressedImage.error)
        throw createError({
          message: `Помилка сервера під час обробки зображення: ${compressedImage.error}`,
          status: 500,
        })
      }

      const metadata = await this.getMetadata(compressedImage.buffer)

      if (!metadata.metadata) {
        logger.warn('Image metadata extraction failed:', metadata.error)
        throw createError({
          message: `Помилка сервера під час отримання метаданих зображення: ${metadata.error}`,
          status: 500,
        })
      }

      const size = compressedImage.buffer.length
      const key = `${uuidv4()}.avif`

      const image = await db.Image.create({
        key,
        bucket: Bucket,
        mime_type: `image/avif`,
        size_bytes: size,
        metadata: {
          width: metadata.metadata.width,
          height: metadata.metadata.height,
        },
      }, { transaction })

      const s3Command = new PutObjectCommand({
        Key: key,
        Body: compressedImage.buffer,
        ContentType: `image/avif`,
        ContentLength: size,
        ACL: 'public-read',
        Bucket,
        Metadata: {
          width: metadata.metadata.width.toString(),
          height: metadata.metadata.height.toString(),
        },
      })

      await s3.send(s3Command)

      return image
    })
  }

  /**
   * Deletes image in s3 and database and throw an error if exists.
   *
   * @param imageId image primary key
   * @returns Image instance
   */
  async destroy(imageId: number) {
    const result = await this.safeDeleteImage(imageId)

    if (!result.ok) {
      throw createError({
        message: 'Зображення не видалено',
        status: 500,
        cause: result.cause,
      })
    }
  }

  /**
   * Deletes images in s3 and database and returns result for every image.
   *
   * @param imageIds image primary keys
   * @returns array of results
   */
  async destroySafely(imageIds: number[]) {
    const deletionPromises = imageIds.map(id => this.safeDeleteImage(id))

    const results = await Promise.all(deletionPromises)

    return results
  }

  /**
   * Deletes image in s3 and database without throw
   *
   * @param imageId image primary key
   * @returns Image instance
   */
  private async safeDeleteImage(imageId: number) {
    const db = useDatabase()
    const { s3 } = useObjectStorage()

    const image = await db.Image.findByPk(imageId)

    try {
      if (!image) {
        throw new Error('Зображення не знайдено')
      }

      const s3Command = new DeleteObjectCommand({
        Bucket: image.bucket,
        Key: image.key,
      })

      await s3.send(s3Command)

      await image.destroy()

      return {
        ok: true,
        id: imageId,
      }
    }
    catch (error) {
      logger.warn(`Failed to delete image with id ${imageId}:`, error)
      return {
        ok: false,
        id: imageId,
        cause: 'Зображення не вдалося видалити',
      }
    }
  }
}

export const imageService = new ImageService()
