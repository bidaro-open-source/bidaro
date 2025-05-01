import { Op } from 'sequelize'
import { z } from 'zod'
import { roles } from '~/server/constants'
import { registerRequest } from '~/server/requests/auth/register.post'
import { createAuthenticationSession } from '~/server/services/authentication'

export default defineEventHandler(async (event) => {
  const db = useDatabase(event)

  const request = await validateRequest(event, registerRequest)

  const userInDB = await db.User.findAll({
    where: {
      [Op.or]: [
        { email: request.body.email },
        { username: request.body.username },
      ],
    },
  })

  if (userInDB.length) {
    const issues: z.ZodIssue[] = []

    if (userInDB.findIndex(u => u.email === request.body.email) !== -1) {
      issues.push({
        code: 'custom',
        path: ['email'],
        message: 'Електронна пошта вже зайнята',
      })
    }

    if (userInDB.findIndex(u => u.username === request.body.username) !== -1) {
      issues.push({
        code: 'custom',
        path: ['username'],
        message: 'Ім\'я користувача вже зайняте',
      })
    }

    throw createError({
      statusCode: 422,
      message: 'Неправильні дані запиту',
      data: new z.ZodError(issues).flatten(),
    })
  }

  const defaultRole = await db.Role.findOne({
    where: { name: roles.USER },
    include: [
      {
        model: db.Permission,
        as: 'permissions',
        through: {
          attributes: [],
        },
      },
    ],
  })

  if (!defaultRole) {
    throw createError({
      statusCode: 500,
      message: 'Default role not found.',
    })
  }

  const user = await db.User.create({
    email: request.body.email,
    username: request.body.username,
    password: await hashPassword(event, request.body.password),
    roleName: defaultRole.name,
  })

  const metadata = createRequestMetadata(event)

  const session = await createAuthenticationSession(user.id, metadata)

  setRefreshTokenCookie(event, session.refreshToken)

  return {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    session_uuid: session.uuid,
    user: {
      id: user.id as number,
      email: user.email,
      username: user.username,
    },
    role: user.role
      ? { name: user.role.name }
      : null,
    permissions: user.role
      ? user.role.permissions
        ? user.role.permissions.map(p => ({
            name: p.name,
            displayName: p.displayName,
            description: p.description,
          }))
        : []
      : [],
  }
})
