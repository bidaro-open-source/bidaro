import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export type UploadLotImageRequest = ValidatorReturnType<typeof uploadLotImageRequest>

export const uploadLotImageRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  multipart: async (event) => {
    const files = await readMultipartFormData(event)

    if (!files) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['files'],
        message: 'Файли не завантажені',
      }])
    }

    if (!files[0]) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['files'],
        message: 'Файл не передано',
      }])
    }

    if (!allowedMime.includes(files[0].type || '')) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['files'],
        message: 'Невалідний тип файлу',
      }])
    }

    if (files[0].data.length > 5 * 1024 * 1024) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['files'],
        message: 'Файл перевищує 5MB',
      }])
    }

    return files[0]
  },
})
