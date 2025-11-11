import type { Buffer } from 'buffer'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { deleteS3Object } from './delete-s3-object'

/**
 * Upload the object to s3.
 *
 * Use the clear function to remove an object.
 *
 * Use a unique key, otherwise unexpected behavior may occur.
 *
 * @param Bucket Bucket
 * @param Key Key
 */
export async function createS3Object(Bucket: string, Key: string, Body: Buffer) {
  const s3Command = new PutObjectCommand({ Bucket, Key, Body })

  await s3.send(s3Command)

  const clear = async () => {
    await deleteS3Object(Bucket, Key)
  }

  return { clear }
}
