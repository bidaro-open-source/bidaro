import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function deleteS3Object(Bucket: string, Key: string) {
  const s3Command = new DeleteObjectCommand({ Bucket, Key })

  return await s3.send(s3Command)
}
