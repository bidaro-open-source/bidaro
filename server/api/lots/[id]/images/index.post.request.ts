import { z } from 'zod'
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
      },
    })

    if (!multipart.files[0]) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['files'],
        message: 'Файл не передано',
      }])
    }

    return multipart.files[0]
  },
})
