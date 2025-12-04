import { env } from 'node:process'
import { S3Client } from '@aws-sdk/client-s3'
import { afterAll, beforeAll } from 'vitest'

let s3Client: S3Client | undefined

function useObjectStorage() {
  try {
    if (!s3Client) {
      s3Client = new S3Client({
        region: env.S3_REGION as string,
        endpoint: env.S3_ENDPOINT as string,
        forcePathStyle: true,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID as string,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY as string,
        },
      })
    }

    return s3Client
  }
  catch (e) {
    throw new Error('Object storage connection failed')
  }
}

beforeAll(() => {
  // @ts-expect-error type
  globalThis.s3 = useObjectStorage()
  // @ts-expect-error type
  globalThis.s3Bucket = env.S3_BUCKET as string
})

afterAll(async () => {
  // @ts-expect-error type
  delete globalThis.s3
  // @ts-expect-error type
  delete globalThis.s3Bucket
})

declare global {
  let s3: ReturnType<typeof useObjectStorage>
  let s3Bucket: string
}
