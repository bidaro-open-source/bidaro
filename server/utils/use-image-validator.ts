import type { Buffer } from 'node:buffer'
import sharp from 'sharp'

/**
 * Configuration options for image validation.
 */
interface ImageValidationOptions {
  /**
   * Maximum allowed dimension (width or height) in pixels.
   * Default: 8192 (8K).
   */
  maxDimension?: number
  /**
   * List of allowed image formats (as defined by Sharp).
   * Default: ['jpeg', 'png', 'webp'].
   */
  allowedFormats?: (keyof sharp.FormatEnum)[]
}

/**
 * Validates an image buffer against format and dimension constraints using Sharp.
 *
 * Checks for "magic bytes" to ensure the file is a real image.
 *
 * @param buffer - The binary buffer of the image file.
 * @param options - Validation configuration.
 * @returns Verified metadata of the image.
 * @throws 400 If the image is invalid, corrupted, or violates constraints.
 */
export async function useImageValidator(buffer: Buffer, options: ImageValidationOptions = {}) {
  const maxDimension = options.maxDimension ?? 8192
  const allowedFormats = options.allowedFormats ?? ['jpeg', 'png', 'webp']

  try {
    const metadata = await sharp(buffer).metadata()

    if (!metadata.format || !metadata.width || !metadata.height) {
      throw new Error('Unable to determine image format or dimensions')
    }

    if (!allowedFormats.includes(metadata.format as keyof sharp.FormatEnum)) {
      throw new Error(`Format "${metadata.format}" is not allowed. Allowed: ${allowedFormats.join(', ')}`)
    }

    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      throw new Error(`Image is too large (${metadata.width}x${metadata.height}). Max dimension allowed: ${maxDimension}px`)
    }

    if (metadata.width === 0 || metadata.height === 0) {
      throw new Error('Image has zero dimensions')
    }

    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
    }
  }
  catch (err: any) {
    console.warn('Image validation error:', err.message)

    throw createError({
      statusCode: 400,
      message: `Неправильний або пошкоджений файл зображення: ${err.message}`,
    })
  }
}
