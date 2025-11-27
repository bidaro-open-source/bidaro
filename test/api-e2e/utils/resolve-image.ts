import * as path from 'node:path'

interface ResolveImageReturn {
  path: string
  mime: string
  filename: string
}

const images = {
  'image-heavy.png': 'image/png',
  'image-normal.png': 'image/png',
  'image-normal.jpg': 'image/jpg',
  'image-normal.jpeg': 'image/jpeg',
  'image-normal.webp': 'image/webp',
  'image-unsupport.avif': 'image/avif',
  'image-not-jpg-is-png.jpg': 'image/jpg',
  'image-invalid-dimension-by-width.png': 'image/png',
  'image-invalid-dimension-by-height.png': 'image/png',
} as const

/**
 * Return file absolute path with mime type.
 *
 * @param filename image filename in __fixtures__
 * @returns object
 */
export function resolveImage(filename: keyof typeof images | (string & {})): ResolveImageReturn {
  const filePath = path.resolve(__dirname, '..', '__fixtures__', filename)
  const image = images[filename as keyof typeof images]
  const mime = image || 'application/octet-stream'

  return {
    path: filePath,
    filename,
    mime,
  }
}
