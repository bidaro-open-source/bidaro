import { userRepository } from '~~/server/repositories/user.repository'
import { createLotResource } from '~~/server/resources/lot.resource'
import { lotService } from '~~/server/services/lot.service'
import { getLotRequest } from '../index.request'
import { closeLotPolicy } from './index.post.policy'

export default defineEventHandler(async (event) => {
  mustBeAuthenticated(event)

  const request = await getLotRequest(event)

  const lot = await lotService.findByIdOrFail(request.params.id)

  closeLotPolicy(event, lot)

  const updatedLot = await lotService.close(request.params.id)

  if (updatedLot.winnerId) {
    const winner = await userRepository.findById(updatedLot.winnerId)
    const seller = await userRepository.findById(updatedLot.sellerId)

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

  return createLotResource(updatedLot)
})
