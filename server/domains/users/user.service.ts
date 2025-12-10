import type { UserAttributesOptional } from '#database'
import { lotBetRepository, lotImageRepository, lotRepository } from '../auction'
import { authService } from '../authentication'
import { imageService } from '../storage'
import { userRepository } from './user.repository'
import { userSource } from './user.source'

class UserService {
  /**
   * Updates user's profile.
   *
   * @param id - user primary key
   * @param data - profile data to update
   * @returns updated user instance
   * @throws USER_NOT_FOUND
   */
  async update(id: number, data: Pick<UserAttributesOptional, 'name' | 'surname'>) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createAppError('USER_NOT_FOUND', { id })
      }

      if (data.name === undefined && data.surname === undefined) {
        return user
      }

      if (data.name === user.name && data.surname === user.surname) {
        return user
      }

      const name = Object.hasOwn(data, 'name') ? data.name : user.name
      const surname = Object.hasOwn(data, 'surname') ? data.surname : user.surname

      const updatedUser = await userRepository.updateByPk(
        id,
        {
          name: name || null,
          surname: surname || null,
        },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'user.service.update', async () => {
        await userSource.invalidate([user, updatedUser])
      })

      return updatedUser
    })
  }

  /**
   * Updates user's email.
   *
   * @param id - user primary key
   * @param email - new email
   * @returns updated user instance
   * @throws USER_NOT_FOUND
   * @throws VALIDATION_ERROR
   */
  async updateEmail(id: number, email: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createAppError('USER_NOT_FOUND', { id })
      }

      if (user.email === email) {
        return user
      }

      const userInDB = await userRepository.findByEmail(email, { transaction })

      if (userInDB) {
        throw createAppError('VALIDATION_ERROR', {
          fieldErrors: { email: ['Електронна пошта вже зайнята'] },
        })
      }

      const updatedUser = await userRepository.updateByPk(
        id,
        { email, emailVerifiedAt: null },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'user.service.update_email', async () => {
        await userSource.invalidate([user, updatedUser])
      })

      return updatedUser
    })
  }

  /**
   * Updates user's password.
   *
   * @param id - user primary key
   * @param password - new password
   * @returns updated user instance
   * @throws USER_NOT_FOUND
   */
  async updatePassword(id: number, password: string) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createAppError('USER_NOT_FOUND', { id })
      }

      const hashedPassword = await hashPassword(password)

      const updatedUser = await userRepository.updateByPk(
        id,
        { password: hashedPassword },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'user.service.update-password', async () => {
        await userSource.invalidate([user, updatedUser])
      })

      return updatedUser
    })
  }

  /**
   * Verifies user's email.
   *
   * @param id - user primary key
   * @returns updated user instance
   * @throws USER_NOT_FOUND
   */
  async verifyEmail(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createAppError('USER_NOT_FOUND', { id })
      }

      const updatedUser = await userRepository.updateByPk(
        id,
        { emailVerifiedAt: new Date() },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'user.service.verify_email', async () => {
        await userSource.invalidate([user, updatedUser])
      })

      return updatedUser
    })
  }

  /**
   * Updates user's role.
   *
   * @param id - user primary key
   * @param roleName - new role name (or null to remove role)
   * @returns updated user instance
   * @throws USER_NOT_FOUND
   */
  async updateRole(id: number, roleName: string | null) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createAppError('USER_NOT_FOUND', { id })
      }

      if (user.roleName === roleName) {
        return user
      }

      const updatedUser = await userRepository.updateByPk(
        id,
        { roleName },
        { transaction },
      )

      useDatabaseAfterCommit(transaction, 'user.service.update_role', async () => {
        await userSource.invalidate([user, updatedUser])
      })

      return updatedUser
    })
  }

  /**
   * Deletes a user by their primary key.
   * Deletes all their lots (with images via cascade), bids, and sessions.
   *
   * @param id - user primary key
   * @throws USER_NOT_FOUND
   */
  async delete(id: number) {
    return await useDatabaseTransaction(async (transaction) => {
      const user = await userRepository.findByPk(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      if (!user) {
        throw createAppError('USER_NOT_FOUND', { id })
      }

      const lots = await lotRepository.findAllBySellerIdWithLock(id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      })

      for (const lot of lots) {
        const images = await lotImageRepository.findAllByLotId(lot.id, {
          transaction,
        })

        const imagesIds = images.map(image => image.id)

        await imageService.destroySafely(imagesIds)

        await lotRepository.destroyByPk(lot.id, { transaction })
      }

      await lotBetRepository.destroyByUserId(id, { transaction })

      const sessions = await authService.getSessions(id)
      const sessionUuids = Object.values(sessions).map(session => session.uuid)

      if (sessionUuids.length > 0) {
        await authService.deleteSessions(id, sessionUuids)
      }

      await userRepository.destroyByPk(id, { transaction })

      useDatabaseAfterCommit(transaction, 'user.service.delete', async () => {
        await userSource.invalidate(user)
      })
    })
  }
}

export const userService = new UserService()
