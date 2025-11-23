import type { UserAttributesOptional } from '../database'
import { REDIS_SESSION_NAMESPACE } from './authentication.service'
import { userRepository } from '../repositories/user.repository'

export const userService = {
  /**
   * Updates user's profile.
   *
   * @param id - user primary key
   * @param data - profile data to update
   * @returns updated user instance
   * @throws 404 if user not found
   */
  async update(id: number, data: Pick<UserAttributesOptional, 'name' | 'surname'>) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Користувача не знайдено',
        })
      }

      if (data.name === undefined && data.surname === undefined) {
        return user
      }

      if (data.name === user.name && data.surname === user.surname) {
        return user
      }

      const name = Object.hasOwn(data, 'name') ? data.name : user.name
      const surname = Object.hasOwn(data, 'surname') ? data.surname : user.surname

      const updatedUser = await userRepository.updateById(
        id,
        {
          name: name || null,
          surname: surname || null,
        },
        { transaction },
      )

      return updatedUser
    })
  },

  /**
   * Updates user's email.
   *
   * @param id - user primary key
   * @param email - new email
   * @returns updated user instance
   * @throws 404 if user not found
   * @throws 400 if email is already taken
   */
  async updateEmail(id: number, email: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Користувача не знайдено',
        })
      }

      if (user.email === email) {
        return user
      }

      const userInDB = await userRepository.findByEmail(email, { transaction })

      if (userInDB) {
        throw createError({
          statusCode: 400,
          message: 'Електронна пошта вже зайнята',
        })
      }

      return await userRepository.updateById(
        id,
        { email, emailVerifiedAt: null },
        { transaction },
      )
    })
  },

  /**
   * Updates user's password.
   *
   * @param id - user primary key
   * @param password - new password
   * @returns updated user instance
   * @throws 404 if user not found
   */
  async updatePassword(id: number, password: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Користувача не знайдено',
        })
      }

      const hashedPassword = await hashPassword(password)

      return await userRepository.updateById(
        id,
        { password: hashedPassword },
        { transaction },
      )
    })
  },

  /**
   * Verifies user's email.
   *
   * @param id - user primary key
   * @returns updated user instance
   * @throws 404 if user not found
   */
  async verifyEmail(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Користувача не знайдено',
        })
      }

      return await userRepository.updateById(
        id,
        { emailVerifiedAt: new Date() },
        { transaction },
      )
    })
  },

  /**
   * Updates user's role.
   *
   * @param id - user primary key
   * @param roleName - new role name (or null to remove role)
   * @returns updated user instance
   * @throws 404 if user not found
   */
  async updateRole(id: number, roleName: string | null) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Користувача не знайдено',
        })
      }

      if (user.roleName === roleName) {
        return user
      }

      return await userRepository.updateById(
        id,
        { roleName },
        { transaction },
      )
    })
  },

  /**
   * Deletes a user by their primary key.
   * Deletes all their lots (with images via cascade), bids, and sessions.
   *
   * @param id - user primary key
   * @throws 404 if user not found
   */
  async deleteById(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const db = useDatabase()

      const user = await userRepository.findByIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createError({
          statusCode: 404,
          message: 'Користувача не знайдено',
        })
      }

      // Delete all bids made by this user
      // (LotBet has onDelete: SET NULL but userId is NOT NULL, so we need to delete manually)
      await db.LotBet.destroy({
        where: { userId: id },
        transaction,
      })

      // Delete all sessions for this user from Redis
      const redis = useRedis()
      const sessionKey = `${REDIS_SESSION_NAMESPACE}:${id}`
      const tokens = await redis.smembers(sessionKey)

      if (tokens.length > 0) {
        const sessionKeys = tokens.map((token: string) => `${REDIS_SESSION_NAMESPACE}:${token}`)
        await redis.del(...sessionKeys)
        await redis.del(sessionKey)
      }

      // Delete user (lots will cascade delete via database constraint)
      await userRepository.destroyById(id, { transaction })
    })
  },
}
