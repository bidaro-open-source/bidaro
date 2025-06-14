import { z } from 'zod'
import { primaryKeySchema } from '~~/server/zod/primary-key'

const allowedMime = ['image/jpeg', 'image/png', 'image/webp']

export type UploadLotImageRequest = ValidatorReturnType<typeof uploadLotImageRequest>
export const uploadLotImageRequest = createRequestValidator({
  params: z.object({
    id: primaryKeySchema,
  }),
  multipart: async (event) => {
    const files = await readMultipartFormData(event)

    if (!files)
      throw new Error('Файли не завантажені')

    if (!files[0])
      throw new Error('Файл не передано')

    if (!allowedMime.includes(files[0].type || ''))
      throw new Error('Невалідний тип файлу')

    if (files[0].data.length > 5 * 1024 * 1024)
      throw new Error('Файл перевищує 5MB')

    return files[0]
  },
})
