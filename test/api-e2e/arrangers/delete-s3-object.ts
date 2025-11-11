import { DeleteObjectCommand } from '@aws-sdk/client-s3'

/**
 * Deletes the object from s3 by the key.
 *
 * If the object has already been deleted, it does not cause an error.
 *
 * @param Bucket Bucket
 * @param Key Key
 */
export async function deleteS3Object(Bucket: string, Key: string) {
  const s3Command = new DeleteObjectCommand({ Bucket, Key })

  await s3.send(s3Command)
}
