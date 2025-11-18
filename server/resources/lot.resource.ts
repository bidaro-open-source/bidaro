import type { Lot } from '../database'

export type LotResource = ReturnType<typeof createLotResource>

export function createLotResource(entity: Lot) {
  return {
    id: entity.id as number,
    bets: entity.bets,
    seller: entity.seller
      ? {
          id: entity.seller.id as number,
          username: entity.seller.username,
        }
      : null,
    winner: entity.winner
      ? {
          id: entity.winner.id as number,
          username: entity.winner.username,
        }
      : null,
    images: entity.images,
    title: entity.title,
    initialPrice: entity.initialPrice,
    currentPrice: entity.currentPrice,
    effectiveDate: entity.effectiveDate,
    expirationDate: entity.expirationDate,
    initialDuration: entity.initialDuration,
    statusName: entity.statusName,
  }
}

export type MinimalLotResource = ReturnType<typeof createMinimalLotResource>

export function createMinimalLotResource(entity: Lot) {
  return {
    id: entity.id as number,
    seller: entity.seller,
    winner: entity.winner,
    category: entity.category,
    cover: entity.cover?.image,
    title: entity.title,
    initialPrice: entity.initialPrice,
    currentPrice: entity.currentPrice,
    effectiveDate: entity.effectiveDate,
    expirationDate: entity.expirationDate,
    initialDuration: entity.initialDuration,
    statusName: entity.statusName,
  }
}

export type OnlyLotResource = ReturnType<typeof createOnlyLotResource>

export function createOnlyLotResource(entity: Lot) {
  return {
    id: entity.id as number,
    sellerId: entity.sellerId as number,
    winnerId: entity.winnerId as number,
    categoryId: entity.categoryId as number,
    title: entity.title,
    initialPrice: entity.initialPrice,
    currentPrice: entity.currentPrice,
    effectiveDate: entity.effectiveDate,
    expirationDate: entity.expirationDate,
    initialDuration: entity.initialDuration,
    statusName: entity.statusName,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}
