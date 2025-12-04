import type { ImageAttributes } from '#database'
import { BaseResource } from '#classes/BaseResource'

export interface ImageDto {
  id: number
  key: string
  bucket: string
  mime: string
}

class ImageResource extends BaseResource<ImageAttributes, ImageDto> {
  protected transform(entity: ImageAttributes): ImageDto {
    return {
      id: entity.id as number,
      key: entity.key,
      bucket: entity.bucket,
      mime: entity.mime_type,
    }
  }
}

export const imageResource = new ImageResource()
