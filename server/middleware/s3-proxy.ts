import { proxyRequest } from 'h3'

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()

  const url = event.node.req.url

  if (url && url.startsWith('/s3/')) {
    const path = url.replace(/^.{4}/g, '')
    const proxyUrl = `${runtimeConfig.s3.endpoint}/${runtimeConfig.s3.bucket}/${path}`

    return proxyRequest(event, proxyUrl)
  }
})
