import type { ImageAttributes } from '../../../database'

export type ImageResource = ReturnType<typeof createImageResource>

export function createImageResource(entity: ImageAttributes) {
  return {
    id: entity.id as number,
    key: entity.key,
    bucket: entity.bucket,
    mime: entity.mime_type,
  }
}
