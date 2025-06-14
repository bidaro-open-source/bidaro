import type { Image } from '../database/models/Image'

export const imageResource = {
  create(image: Image) {
    return {
      id: image.id,
      path: image.path,
      createdAt: image.createdAt,
    }
  },
}
