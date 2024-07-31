import { proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()

  const url = event.node.req.url
  const s3Endpoint = runtimeConfig.s3.endpoint
  const s3Bucket = runtimeConfig.s3.bucket

  if (url && url.startsWith('/s3/')) {
    const path = url.replace(/^.{4}/g, '')
    const proxyUrl = `${s3Endpoint}/${s3Bucket}/${path}`

    return proxyRequest(event, proxyUrl)
  }
})
