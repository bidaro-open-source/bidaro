import { z } from 'zod'
import { imageService } from '~~/server/domains/storage'
import { primaryKeySchema } from '~~/server/zod'

export type UploadLotImageRequest = ValidatorReturnType<typeof uploadLotImageRequest>

export const uploadLotImageRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  multipart: async (event) => {
    const multipart = await readMultipartSafely(event, {
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ],
      limits: {
        files: 1,
        fileSize: 5 * 1024 * 1024,
      },
    })

    const image = multipart.files[0]

    if (!image) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['files'],
        message: 'Файл не передано',
      }])
    }

    const validatedImage = await imageService.validateBuffer(image.buffer)

    if (!validatedImage.buffer) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['files'],
        message: `Невірний файл зображення: ${validatedImage.error}`,
      }])
    }

    return {
      buffer: validatedImage.buffer,
      originalFilename: image.filename,
      originalMimetype: image.mimetype,
    }
  },
})
