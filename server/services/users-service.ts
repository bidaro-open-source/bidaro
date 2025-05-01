import type { User } from '../database'

/**
 * Fetch user by the primary key
 *
 * User data:
 * - `User` inctance with all attributes
 * - `User` include `Role` association with all attributes
 * - `Role` include `Permission` association with all attributes
 *
 * @param id user primary key
 * @returns user
 */
export function fetchUser(id: number): Promise<User | null> {
  const db = useDatabase()

  return db.User.findOne({
    where: { id },
    include: [
      {
        model: db.Role,
        as: 'role',
        include: [
          {
            model: db.Permission,
            as: 'permissions',
            through: {
              attributes: [],
            },
          },
        ],
      },
    ],
  })
}

export function fetchUserByUsername(username: string): Promise<User | null> {
  const db = useDatabase()

  return db.User.findOne({
    where: { username },
    include: [
      {
        model: db.Role,
        as: 'role',
        include: [
          {
            model: db.Permission,
            as: 'permissions',
            through: {
              attributes: [],
            },
          },
        ],
      },
    ],
  })
}
