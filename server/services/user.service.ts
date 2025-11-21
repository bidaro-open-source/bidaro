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
    const transaction = await useDatabaseTransaction()

    const user = await userRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!user) {
      await transaction.rollback()
      throw createError({
        statusCode: 404,
        message: 'Користувача не знайдено',
      })
    }

    try {
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

      await transaction.commit()

      return updatedUser
    }
    catch (error) {
      await transaction.rollback()
      throw createError({
        statusCode: 500,
        message: 'Не вдалося оновити профіль користувача',
        cause: error,
      })
    }
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
    const transaction = await useDatabaseTransaction()

    const user = await userRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!user) {
      await transaction.rollback()
      throw createError({
        statusCode: 404,
        message: 'Користувача не знайдено',
      })
    }

    if (user.email === email) {
      await transaction.commit()
      return user
    }

    const userInDB = await userRepository.findByEmail(email, { transaction })

    if (userInDB) {
      await transaction.rollback()
      throw createError({
        statusCode: 400,
        message: 'Електронна пошта вже зайнята',
      })
    }

    try {
      const updatedUser = await userRepository.updateById(
        id,
        { email, emailVerifiedAt: null },
        { transaction },
      )

      await transaction.commit()

      return updatedUser
    }
    catch (error) {
      await transaction.rollback()
      throw createError({
        statusCode: 500,
        message: 'Не вдалося оновити електронну пошту',
        cause: error,
      })
    }
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
    const transaction = await useDatabaseTransaction()

    const user = await userRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!user) {
      await transaction.rollback()
      throw createError({
        statusCode: 404,
        message: 'Користувача не знайдено',
      })
    }

    try {
      const hashedPassword = await hashPassword(password)

      const updatedUser = await userRepository.updateById(
        id,
        { password: hashedPassword },
        { transaction },
      )

      await transaction.commit()

      return updatedUser
    }
    catch (error) {
      await transaction.rollback()
      throw createError({
        statusCode: 500,
        message: 'Не вдалося оновити пароль',
        cause: error,
      })
    }
  },

  /**
   * Verifies user's email.
   *
   * @param id - user primary key
   * @returns updated user instance
   * @throws 404 if user not found
   */
  async verifyEmail(id: number) {
    const transaction = await useDatabaseTransaction()

    const user = await userRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!user) {
      await transaction.rollback()
      throw createError({
        statusCode: 404,
        message: 'Користувача не знайдено',
      })
    }

    try {
      const updatedUser = await userRepository.updateById(
        id,
        { emailVerifiedAt: new Date() },
        { transaction },
      )

      await transaction.commit()

      return updatedUser
    }
    catch (error) {
      await transaction.rollback()
      throw createError({
        statusCode: 500,
        message: 'Не вдалося верифікувати електронну пошту',
        cause: error,
      })
    }
  },

  /**
   * Deletes a user by their primary key.
   *
   * @param id - user primary key
   * @throws 404 if user not found
   */
  async deleteById(id: number) {
    const transaction = await useDatabaseTransaction()

    const user = await userRepository.findByIdWithLock(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    })

    if (!user) {
      await transaction.rollback()
      throw createError({
        statusCode: 404,
        message: 'Користувача не знайдено',
      })
    }

    try {
      await userRepository.destroyById(id, { transaction })

      await transaction.commit()
    }
    catch (error) {
      await transaction.rollback()
      throw createError({
        statusCode: 500,
        message: 'Не вдалося видалити користувача',
        cause: error,
      })
    }
  },
}
