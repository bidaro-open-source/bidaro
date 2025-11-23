import { HeadObjectCommand } from '@aws-sdk/client-s3'

/**
 * Get the object from s3.
 *
 * @param Bucket Bucket
 * @param Key Key
 */
export async function getS3Object(Bucket: string, Key: string) {
  const s3Command = new HeadObjectCommand({ Bucket, Key })

  return await s3.send(s3Command)
}
