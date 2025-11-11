import * as fs from 'node:fs'
import { createS3Object } from './create-s3-object'

interface Options {
  mime?: string
}

/**
 * Creates the image to database and upload image to s3.
 *
 * @param path path to image
 * @param options image options
 * @returns image instance with clear function
 */
export async function createImage(path: string, options: Options = {}) {
  const file = fs.readFileSync(path)

  if (!file) {
    throw new Error('Image file not found')
  }

  const image = await db.ImageFactory.new().create({
    bucket: s3Bucket,
    size_bytes: file.length,
    mime_type: options.mime,
  })

  const s3Image = await createS3Object(s3Bucket, image.key, file)

  const clear = async () => {
    await s3Image.clear()
    await image.destroy()
  }

  return { image, clear }
}
