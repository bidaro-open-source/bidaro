import { S3Client } from '@aws-sdk/client-s3'

interface ReturnType {
  s3: S3Client
  Bucket: string
}

/**
 * Singleton instance of the S3Client.
 */
let s3Client: S3Client | undefined

/**
 * Bucket name
 */
let bucket: string | undefined

/**
 * Returns a singleton aws s3 client instance.
 *
 * @param event H3Event
 * @returns A configured s3 client instance
 *
 * @example
 * // Use in API route handler
 * export default defineEventHandler(async (event) => {
 *   const s3 = useObjectStorage(event)
 * })
 */
export function useObjectStorage(event?: H3Event): ReturnType {
  try {
    if (!s3Client) {
      const runtimeConfig = useRuntimeConfig(event)

      s3Client = new S3Client({
        region: runtimeConfig.s3.region,
        endpoint: runtimeConfig.s3.endpoint,
        forcePathStyle: true,
        credentials: {
          accessKeyId: runtimeConfig.s3.accessKeyId,
          secretAccessKey: runtimeConfig.s3.secretAccessKey,
        },
      })
    }

    if (!bucket) {
      const runtimeConfig = useRuntimeConfig(event)

      bucket = runtimeConfig.s3.bucket
    }

    return {
      s3: s3Client,
      Bucket: bucket,
    }
  }
  catch (error) {
    logger.error('Failed to create S3 client', error)
    throw createAppError('INTERNAL_SERVER_ERROR')
  }
}
