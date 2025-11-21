import type { UserAttributesOptional } from '../database'
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
   * Deletes a user by their primary key.
   *
   * @param id - user primary key
   * @throws 404 if user not found
   */
  async deleteById(id: number) {
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

      await userRepository.destroyById(id, { transaction })
    })
  },
}
