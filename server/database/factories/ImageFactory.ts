import type {
  Database,
  Image,
  ImageAttributes,
  ImageAttributesOptional,
} from '#database'
import { v4 as uuidv4 } from 'uuid'
import { Factory } from '../class/Factory'

type PartialAttributes = Partial<ImageAttributes>
type CreationAttributes = ImageAttributesOptional

export class ImageFactory extends Factory<Image> {
  protected definition(attr: PartialAttributes): CreationAttributes {
    if (!attr.bucket) {
      throw new Error('Bucket must be defined.')
    }

    return {
      key: `${uuidv4()}`,
      bucket: attr.bucket,
      mime_type: attr.mime_type || 'application/octet-stream',
      size_bytes: attr.size_bytes || 0,
    }
  }
}

export function InitializeImageFactroy(database: Database) {
  ImageFactory.init(database.Image)
  return ImageFactory
}
