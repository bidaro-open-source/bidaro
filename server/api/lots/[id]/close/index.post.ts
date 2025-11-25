import { createLotResource } from '~~/server/resources/lot.resource'
import { createUserResource } from '~~/server/resources/user.resource'
import { lotService } from '~~/server/services/lot.service'
import { lotSource } from '~~/server/sources/lot.source'
import { userSource } from '~~/server/sources/user.source'
import { getLotRequest } from '../index.request'
import { closeLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotSource.getById(request.params.id)

  closeLotPolicy(event, lot)

  const updatedLot = await lotService.close(request.params.id)
  const winner = updatedLot.winnerId
    ? await userSource.getById(updatedLot.winnerId)
    : null

  if (updatedLot.winnerId) {
    const seller = await userSource.getById(updatedLot.sellerId)

    winner && await sendEmail(event, {
      to: winner.email,
      subject: 'Вітаємо! Ви виграли лот на Bidaro',
      template: {
        html: `Вітаємо! Ви виграли лот "${updatedLot.title}". Зв'яжіться з продавцем: ${seller?.email}`,
        text: `Вітаємо! Ви виграли лот "${updatedLot.title}". Зв'яжіться з продавцем: ${seller?.email}`,
      },
    })

    seller && await sendEmail(event, {
      to: seller.email,
      subject: 'Ваш лот було продано на Bidaro',
      template: {
        html: `Ваш лот "${updatedLot.title}" було продано користувачу: ${winner?.email}`,
        text: `Ваш лот "${updatedLot.title}" було продано користувачу: ${winner?.email}`,
      },
    })
  }

  return {
    ...createLotResource(updatedLot),
    winner: winner ? createUserResource(winner) : null,
  }
})
