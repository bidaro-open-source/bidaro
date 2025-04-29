export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const db = useDatabase(event)

  const user = getAuthenticatedUser(event)

  const userInDB = await db.User.findOne({
    where: { id: user.id },
    include: [
      {
        model: db.Role,
        as: 'role',
        attributes: ['name'],
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

  if (!userInDB) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач не існує',
    })
  }

  return userInDB
})
