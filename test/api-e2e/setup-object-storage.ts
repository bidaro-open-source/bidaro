import { env } from 'node:process'
import { S3Client } from '@aws-sdk/client-s3'
import { afterAll, beforeAll } from 'vitest'

let s3Client: S3Client | undefined
let bucket: string | undefined

function useObjectStorage() {
  try {
    if (!s3Client) {
      s3Client = new S3Client({
        region: env.NUXT_S3_REGION as string,
        endpoint: env.NUXT_S3_ENDPOINT as string,
        forcePathStyle: true,
        credentials: {
          accessKeyId: env.NUXT_S3_ACCESS_KEY_ID as string,
          secretAccessKey: env.NUXT_S3_SECRET_ACCESS_KEY as string,
        },
      })
    }

    if (!bucket) {
      bucket = env.NUXT_S3_BUCKET
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
})

afterAll(async () => {
  // @ts-expect-error type
  delete globalThis.s3
})

declare global {
  let s3: ReturnType<typeof useObjectStorage>
}
