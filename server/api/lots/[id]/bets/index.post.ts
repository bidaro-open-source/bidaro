import { lotStatuses } from '~~/server/constants'
import { lotBetRepository } from '~~/server/repositories/lot-bet.repository'
import { lotRepository } from '~~/server/repositories/lot.repository'
import { lotService } from '~~/server/services/lot.service'
import { createLotBetPolicy } from './index.post.policy'
import { createLotBetRequest } from './index.post.request'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const user = getAuthenticatedUser(event)

  const request = await createLotBetRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  createLotBetPolicy(event, lot)

  if (lot.statusName !== lotStatuses.IN_TRADING_PROCESS) {
    throw createError({
      statusCode: 400,
      message: 'Неможливо зробити ставку на лот, який не знаходиться в процесі торгів',
    })
  }

  if (!lot.expirationDate || lot.expirationDate <= new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Неможливо зробити ставку на лот',
    })
  }

  if (!lot.currentPrice || lot.currentPrice >= request.body.amount) {
    throw createError({
      statusCode: 400,
      message: 'Ставка повинна бути більшою за поточну ціну лоту',
    })
  }

  const transaction = await useDatabaseTransaction()

  try {
    const bet = await lotBetRepository.create({
      lotId: lot.id,
      userId: user.id,
      amount: request.body.amount,
    }, { transaction })

    lot.currentPrice = request.body.amount

    await lotRepository.save(lot, { transaction })

    await transaction.commit()

    return {
      id: bet.id,
      lotId: bet.lotId,
      userId: bet.userId,
      amount: bet.amount,
      createdAt: bet.createdAt,
    }
  }
  catch (error) {
    await transaction.rollback()
    throw error
  }
})
