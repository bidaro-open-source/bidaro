import { imageRepository } from '../repositories/image.repository'

interface MultiPartData {
  data: any
  name?: string
  filename?: string
  type?: string
}

export async function registerImage(file: MultiPartData) {
  const timestamp = Date.now()

  const key = `i${timestamp}`

  await useStorage('s3').setItemRaw(key, file.data, {
    headers: {
      'Content-Type': file.type,
      'Content-Length': file.data.length,
    },
  })

  return await imageRepository.create({ path: key })
}

export async function unregisterImage(id: number) {
  const image = await imageRepository.findById(id)

  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Зображення не знайдено',
    })
  }

  await useStorage('s3').removeItem(image.path, { removeMeta: true })

  await imageRepository.destroy(image)
}
