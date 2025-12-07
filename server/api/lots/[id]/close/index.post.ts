import { lotResource, lotService, lotSource } from '#domains/auction'
import { userResource, userSource } from '#domains/users'
import { viewLotRequest } from '../index.request'
import { closeLotPolicy } from './index.post.policy'

/**
 * API endpoint handler
 */
export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  await useRateLimiter(event, {
    authenticatedLimit: 10,
    anonymousLimit: 0,
    duration: 60,
  })

  const request = await viewLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  closeLotPolicy(event, lot)

  const updatedLot = await lotService.close(request.params.id)
  const winner = updatedLot.winnerId
    ? await userSource.getByPk(updatedLot.winnerId)
    : null

  if (updatedLot.winnerId) {
    const seller = await userSource.getByPk(updatedLot.sellerId)

    winner && await sendMail(event, {
      to: winner.email,
      subject: 'Вітаємо! Ви виграли лот на Bidaro',
      template: {
        html: `Вітаємо! Ви виграли лот "${updatedLot.title}". Зв'яжіться з продавцем: ${seller?.email}`,
        text: `Вітаємо! Ви виграли лот "${updatedLot.title}". Зв'яжіться з продавцем: ${seller?.email}`,
      },
    })

    seller && await sendMail(event, {
      to: seller.email,
      subject: 'Ваш лот було продано на Bidaro',
      template: {
        html: `Ваш лот "${updatedLot.title}" було продано користувачу: ${winner?.email}`,
        text: `Ваш лот "${updatedLot.title}" було продано користувачу: ${winner?.email}`,
      },
    })
  }

  return {
    ...lotResource.make(updatedLot),
    winner: userResource.make(winner),
  }
})
