import { createProfileResource } from '../resources/profile-resource'

export default defineEventHandler(async () => {
  const db = useDatabase()

  const user = await db.User.findOne({
    where: { username: 'test' },
    include: [
      {
        model: db.Role,
        as: 'role',
        include: [
          {
            model: db.Permission,
            as: 'permissions',
          },
        ],
      },
    ],
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Користувач не існує',
    })
  }

  return createProfileResource(user)
})
