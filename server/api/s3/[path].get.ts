export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig()

  const params = getRouterParams(event)

  if (typeof params.path !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid path',
    })
  }

  const proxyUrl = `${runtimeConfig.s3.endpoint}/${runtimeConfig.s3.bucket}/${params.path}`

  return sendProxy(event, proxyUrl)
})
