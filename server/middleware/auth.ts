export default defineEventHandler(async (event) => {
  event.context.auth = { isAuthenticated: false }

  const db = useDatabase(event)
  const authorization = getRequestHeader(event, 'Authorization')

  if (!authorization)
    return

  const [type, token] = authorization.split(' ')

  if (type !== 'Bearer') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Метод авторизації не дозволений',
    })
  }

  const verifed = verifyAccessToken(token)

  if (!verifed) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Токен авторизації недійсний',
    })
  }

  const payload = decodeAccessToken(token)

  const user = await db.User.findOne({
    where: { id: payload.uid },
    include: [
      {
        model: db.Role,
        as: 'role',
        include: [
          {
            model: db.Permission,
            as: 'permissions',
            attributes: ['name'],
          },
        ],
      },
    ],
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач до якого є доступ не існує',
    })
  }

  event.context.auth.uid = payload.uid
  event.context.auth.user = user
  event.context.auth.assessToken = token
  event.context.auth.isAuthenticated = true
})
